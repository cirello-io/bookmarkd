all: assets darwin

assets:
	cd frontend; npm install; SASS_PATH=./node_modules npm run build;
	go-bindata-assetfs -o bindata_assetfs.go -pkg generated frontend/build/...
	mv bindata_assetfs.go generated

darwin:
	go build -o bookmarkd ./cmd/bookmarkd

linux:
	docker run -ti --rm -v $(PWD)/../:/go/src/cirello.io/ \
		-w /go/src/cirello.io/bookmarkd golang \
		/bin/bash -c 'go build -o bookmarkd.linux ./cmd/bookmarkd'

test:
	GO111MODULE=on go test -v ./...
