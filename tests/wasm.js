const crypto = require('crypto')
const varint = require('varint')
const path = require('path')
const test = require('tape')
const fs = require('fs')

function load(callback) {
  const filename = path.resolve(__dirname, `../varint.wasm`)
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 })

  fs.readFile(filename, onread)

  function onread(err, buffer) {
    if (err) { return callback(err) }

    const imports = { env: { memory } }

    WebAssembly.instantiate(buffer, imports).then(onwasm, onerror)
  }

  function onwasm(wasm) {
    const { instance } = wasm

    callback(null, instance, wasm.instance.exports.memory || memory)
  }

  function onerror(err) {
    callback(err)
  }
}

test('loads WASM module', (t) => {
  load((err, mod) => {
    t.error(err)
    t.end()
  })
})

test('encode()', (t) => {
  load((err, mod, memory) => {
    t.error(err)

    const {
      varint_encoding_length,
      varint_encode,

      __heap_base
    } = mod.exports

    const heap = Buffer.from(memory.buffer)

    const number = 1024 * 64 * 1024
    const outputSize = varint_encoding_length(number)
    const outputPointer = __heap_base + 0
    const outputBuffer = heap.slice(outputPointer, outputPointer + outputSize)

    varint_encode(number, outputPointer)
    t.ok(0 === Buffer.compare(Buffer.from(varint.encode(number)), outputBuffer))

    t.end()
  })
})

test('encoding_length()', (t) => {
  load((err, mod, memory) => {
    t.error(err)

    const {
      varint_encoding_length,

      __heap_base
    } = mod.exports

    const N1 = 128
    const N2 = 16384
    const N3 = 2097152
    const N4 = 268435456

    t.equal(varint_encoding_length(64), varint.encodingLength(64))
    t.equal(varint_encoding_length(151), varint.encodingLength(151))
    t.equal(varint_encoding_length(181), varint.encodingLength(181))
    t.equal(varint_encoding_length(191), varint.encodingLength(191))
    t.equal(varint_encoding_length(1024), varint.encodingLength(1024))

    t.equal(varint_encoding_length(N1), varint.encodingLength(N1))
    t.equal(varint_encoding_length(N2), varint.encodingLength(N2))
    t.equal(varint_encoding_length(N3), varint.encodingLength(N3))
    t.equal(varint_encoding_length(N4), varint.encodingLength(N4))

    t.end()
  })
})

test('decode()', (t) => {
  load((err, mod, memory) => {
    t.error(err)

    const {
      varint_encoding_length,
      varint_encode,
      varint_decode,

      __heap_base
    } = mod.exports

    const heap = Buffer.from(memory.buffer)

    const number = 64 * 1024 * 1024
    const outputSize = varint_encoding_length(number)
    const outputPointer = __heap_base + 0
    const outputBuffer = heap.slice(outputPointer, outputPointer + outputSize)

    varint_encode(number, outputPointer)
    t.ok(0 === Buffer.compare(Buffer.from(varint.encode(number)), outputBuffer))
    t.equal(varint_decode(outputPointer), varint.decode(outputBuffer))

    t.end()
  })
})
