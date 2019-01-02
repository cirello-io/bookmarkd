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

package web

import "net/http"

type recoverableResponseWriter struct {
	responseWriter http.ResponseWriter
	request        *http.Request
	fallback       http.HandlerFunc
	recovered      bool
}

func (rrw *recoverableResponseWriter) WriteHeader(c int) {
	switch c {
	case 404:
		rrw.fallback.ServeHTTP(rrw.responseWriter, rrw.request)
		rrw.recovered = true
	default:
		rrw.responseWriter.WriteHeader(c)
	}
}

func (rrw *recoverableResponseWriter) Write(b []byte) (int, error) {
	if rrw.recovered {
		return 0, nil
	}
	return rrw.responseWriter.Write(b)
}

func (rrw *recoverableResponseWriter) Header() http.Header {
	return rrw.responseWriter.Header()
}
