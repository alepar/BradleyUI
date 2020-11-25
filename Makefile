BRADLEY_PROTOS  	:= $(shell find ./proto -type f -name '*.proto')
BRADLEY_PBTS     	:= $(patsubst ./proto/%.proto,./src/protots/%_pb.d.ts,$(BRADLEY_PROTOS))

.PHONY: clean proto build

all : build

build : proto
	npm run build

proto : $(BRADLEY_PBTS)

$(BRADLEY_PBTS) &: $(BRADLEY_PROTOS)
	protoc --plugin=./node_modules/.bin/protoc-gen-ts \
		-I=./proto/ \
		--ts_out=./src/protots/ \
		--js_out=import_style=commonjs,binary:./src/protots/ \
		$(BRADLEY_PROTOS)

clean:
	rm -rf ./src/protots/*.ts ./src/protots/*.js
	rm -fr ./build

