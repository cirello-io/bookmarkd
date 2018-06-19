all: assets darwin

assets:
	cd frontend; npm run build;
	go-bindata-assetfs -pkg generated frontend/build/...
	mv bindata_assetfs.go generated

darwin:
	vgo build -o bookmarkd ./cmd/bookmarkd

linux:
	docker run -ti --rm -v $(PWD):/go/src/cirello.io/bookmarkd \
		-w /go/src/cirello.io/bookmarkd golang \
		/bin/bash -c 'go get -u golang.org/x/vgo && vgo build -o bookmarkd.linux ./cmd/bookmarkd'
