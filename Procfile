workdir: $GOPATH/src/cirello.io/bookmarkd
observe: *.go
ignore: /vendor
build-backend: make darwin
backend:       ./bookmarkd http
ui:            restart=tmp cd frontend; SASS_PATH=./node_modules npm run start
