workdir: $GOPATH/src/cirello.io/bookmarkd
observe: *.go
ignore: /vendor
build-backed: go install cirello.io/bookmarkd/cmd/bookmarkd
backend:      $GOPATH/bin/bookmarkd http
ui:           restart=tmp cd frontend; npm run start
