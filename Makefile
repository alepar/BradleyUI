BRADLEY_PROTOS  	:= $(wildcard proto/*.proto)
BRADLEY_PBTS     	:= $(patsubst proto/%.proto,src/protots/%_pb.d.ts,$(BRADLEY_PROTOS))


proto : $(BRADLEY_PBTS)

$(BRADLEY_PBTS) &: $(BRADLEY_PROTOS)
	protoc -I=./proto/ --ts_out=./src/protots/ $(BRADLEY_PROTOS)

.PHONY: clean

clean:
	rm -rf ./src/protots/*_pb.d.ts

