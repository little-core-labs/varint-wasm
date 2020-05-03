const varint = require('varint')
const crypto = require('crypto')
const wasm = require('../')
const test = require('tape')

test('encode()', (t) => {
  const number = 1024 * Math.random() | 0

  t.ok(0 === Buffer.compare(
    Buffer.from(varint.encode(number)),
    wasm.encode(number)
  ))

  t.equal(number, varint.decode(wasm.encode(number)))

  t.end()
})

test('decode()', (t) => {
  const number = 1024 * Math.random() | 0

  t.equal(number, wasm.decode(varint.encode(number)))

  t.end()
})

test('ready()', (t) => {
  wasm.ready((err) => {
    t.error(err)
    t.end()
  })
})
