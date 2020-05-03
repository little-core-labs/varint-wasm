varint-wasm
===========

> A [varint][varint] implementation for WebAssembly (WASM) written in [ZZ][zz] that
> implements an [_Abstract Encoding_][abstract-encoding] interface.

## Installation

### Node

```sh
$ npm install varint-wasm
```

### WAPM

```sh
$ wapm install jwerle/varint-wasm
```

## Usage

```js
const varint = require('varint-wasm')

// wait for module to be ready if loading in a browser environment
varint.ready(() => {
  const encoded = varint.encode(64 * 1024)
  console.log(encoded) // <Buffer 80 80 04>

  const decoded = varint.decode(encoded)
  console.log(decoded) // 65536
})
```

## API

### `buffer = encode(number[, buffer[, offset]])`

Encode a `number` optionally into `buffer` at an optionally
specified `offset`.

### `number = decode(buffer[, offset])`

Decode an input buffer into an integer optionally an optionally
specified `offset`.

### `promise = ready(callback)`

Returns a promise that resolves or rejects when the WebAssembly exports
are loading. In some cases, this may happen synchronously when this
module is loaded.

```js
await b64.ready()
```

## Limits

### Max Integer

Because 32-bit integers are only supported in WASM at the time of
writing, you can only encode numbers up `2**31 -1`.

### Initial Memory

By default, this module allocates 2 pages of memory for the WebAssembly module.
That is `2 * 64 * 1024` bytes.

### Maximum Memory

This module allows at most 256 pages of memory. That is `256 * 64 *
1024` bytes.

## See Also

* https://github.com/chrisdickinson/varint

## License

MIT

[zz]: https://github.com/zetzit/zz
[varint]: https://github.com/chrisdickinson/varint
[abstract-encoding]: https://github.com/mafintosh/abstract-encoding
