CLANG ?= /opt/wasi-sdk/bin/clang

WASMOPT ?= $(shell which wasm-opt)
WASM2JS ?= $(shell pwd)/node_modules/.bin/wasm2js

ifeq ($(CC),cc)
	CC = $(CLANG)
endif

ifeq ($(CC),gcc)
	CC = $(CLANG)
endif

ZZ ?= $(shell which zz)
SRC = $(wildcard src/*.zz)
TARGET = varint.wasm

CFLAGS += --target=wasm32-unknown-unknown # WASM clang target
CFLAGS += -nostdlib # disable stdlib

LDFLAGS += -Wl,--export=__heap_base
LDFLAGS += -Wl,--export=varint_encode
LDFLAGS += -Wl,--export=varint_decode
LDFLAGS += -Wl,--export=varint_encoding_length
LDFLAGS += -Wl,--import-memory # import memory from runtime
LDFLAGS += -Wl,--no-entry # don't look for a _start function
LDFLAGS += -nostartfiles # no startup files

ZZFLAGS += --release

export CC
export CFLAGS
export LDFLAGS

.PHONY: target

build: $(TARGET) varint.js

$(TARGET): $(SRC)
	$(ZZ) build $(ZZFLAGS)
	cp target/release/lib/libvarint.so $@
ifneq ($(WASMOPT),)
	$(WASMOPT) -Oz $@ -o $@
endif

varint.js: $(TARGET)
	$(WASM2JS) $(TARGET) -o $@

clean:
	$(ZZ) clean
	$(RM) varint.js $(TARGET)

test: varint.js
	npm t
