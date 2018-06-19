package main // import "cirello.io/bookmarkd/cmd/bookmarkd"

import (
	"log"
	"os"

	"cirello.io/bookmarkd/pkg/cli"
	"cirello.io/bookmarkd/pkg/db"
)

func main() {
	log.SetPrefix("")
	log.SetFlags(0)

	fn := "bookmarks.db"
	if envFn := os.Getenv("BOOKMARK_DB"); envFn != "" {
		fn = envFn
	}
	db, err := db.Connect(db.Config{Filename: fn})
	if err != nil {
		log.Fatal(err)
	}

	cli.Run(db)
}
