// Copyright 2018 github.com/ucirello
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package web // import "cirello.io/bookmarkd/pkg/web"

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"cirello.io/bookmarkd/generated"
	"cirello.io/bookmarkd/pkg/actions"
	"cirello.io/bookmarkd/pkg/models"
	"cirello.io/bookmarkd/pkg/net"
	"cirello.io/bookmarkd/pkg/pubsub"
	"github.com/gorilla/websocket"
	"github.com/jmoiron/sqlx"
)

// Server implements the web interface.
type Server struct {
	db     *sqlx.DB
	router *http.ServeMux
	pubsub *pubsub.Broker

	username, password string
}

// New creates a web interface handler.
func New(db *sqlx.DB, username, password string) (*Server, error) {
	s := &Server{
		db:       db,
		router:   http.NewServeMux(),
		pubsub:   pubsub.New(),
		username: username,
		password: password,
	}
	err := s.registerRoutes()
	return s, err
}

func (s *Server) registerRoutes() error {
	rootFS := generated.AssetFS()
	rootFS.Prefix = "frontend/build/"
	index, err := rootFS.Open("index.html")
	if err != nil {
		return err
	}
	rootHandler := http.FileServer(rootFS)

	s.router.HandleFunc("/state", s.state)
	s.router.HandleFunc("/loadBookmark", s.loadBookmark)
	s.router.HandleFunc("/newBookmark", s.newBookmark)
	s.router.HandleFunc("/deleteBookmark", s.deleteBookmark)
	s.router.HandleFunc("/ws", s.websocket)
	s.router.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		rootHandler.ServeHTTP(&recoverableResponseWriter{
			responseWriter: w,
			request:        req,
			fallback: func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "text/html; charset=utf-8")
				http.ServeContent(w, r, "index.html", time.Now(), index)
			},
		}, req)
	})
	return nil
}

func (s *Server) unauthorized(w http.ResponseWriter) {
	w.Header().Add("WWW-Authenticate", `Basic realm="bookmarkd"`)
	w.WriteHeader(http.StatusUnauthorized)
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	credsMissing := s.username == "" && s.password == ""
	if credsMissing {
		s.router.ServeHTTP(w, r)
		return
	}

	username, password, ok := r.BasicAuth()
	if !ok {
		s.unauthorized(w)
		return
	}

	isValid := username == s.username && password == s.password
	if !isValid {
		s.unauthorized(w)
		return
	}

	s.router.ServeHTTP(w, r)
}

func (s *Server) state(w http.ResponseWriter, r *http.Request) {
	// TODO: handle Access-Control-Allow-Origin correctly
	w.Header().Set("Access-Control-Allow-Origin", "*")
	bookmarks, err := actions.ListBookmarks(s.db)
	if err != nil {
		log.Println("cannot load all bookmarks:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(bookmarks); err != nil {
		log.Println("cannot marshal bookmarks:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func (s *Server) loadBookmark(w http.ResponseWriter, r *http.Request) {
	// TODO: handle Access-Control-Allow-Origin correctly
	w.Header().Set("Access-Control-Allow-Origin", "*")

	bookmark := &models.Bookmark{}
	if err := json.NewDecoder(r.Body).Decode(bookmark); err != nil {
		log.Println("cannot unmarshal bookmark request:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}

	bookmark = net.CheckLink(bookmark)

	if err := json.NewEncoder(w).Encode(bookmark); err != nil {
		log.Println("cannot marshal bookmark:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}
}

func (s *Server) newBookmark(w http.ResponseWriter, r *http.Request) {
	// TODO: handle Access-Control-Allow-Origin correctly
	w.Header().Set("Access-Control-Allow-Origin", "*")

	bookmark := &models.Bookmark{}
	if err := json.NewDecoder(r.Body).Decode(bookmark); err != nil {
		log.Println("cannot unmarshal bookmark request:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}

	if err := actions.AddBookmark(s.db, bookmark, s.pubsub.Broadcast); err != nil {
		log.Println("cannot save bookmark:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}

	w.Write([]byte("{}"))
}

func (s *Server) deleteBookmark(w http.ResponseWriter, r *http.Request) {
	// TODO: handle Access-Control-Allow-Origin correctly
	w.Header().Set("Access-Control-Allow-Origin", "*")

	bookmark := &models.Bookmark{}
	if err := json.NewDecoder(r.Body).Decode(bookmark); err != nil {
		log.Println("cannot unmarshal bookmark request:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}

	if err := actions.DeleteBookmark(s.db, bookmark, s.pubsub.Broadcast); err != nil {
		log.Println("cannot save bookmark:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}

	w.Write([]byte("{}"))
}

func (s *Server) websocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
		ReadBufferSize:  4096,
		WriteBufferSize: 4096,
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("cannot upgrade to websocket:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError)
		return
	}
	if ws != nil {
		defer ws.Close()
	}

	unsubscribe := s.pubsub.Subscribe(func(msg interface{}) {
		if err := ws.WriteJSON(msg); err != nil {
			log.Println("cannot write websocket message:", err)
			ws.Close()
		}
	})
	defer unsubscribe()
	defer ws.Close()

	log.Println("listening for pings...")
	for {
		msgType, _, err := ws.NextReader()
		if err != nil || msgType == websocket.CloseMessage {
			return
		}
	}
}
