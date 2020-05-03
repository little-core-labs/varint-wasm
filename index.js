const createVarint = require('./varint')
const assert = require('nanoassert')

const WASM_NOT_LOADED_ERR = 'varint-wasm has not loaded yet.'
const BYTES_PER_PAGE = 64 * 1024
const MAX_PAGES = 256

const memory = new WebAssembly.Memory({ initial: 2, maximum: MAX_PAGES })
const wasm = createVarint({ imports: { env: { memory }}})

const promise = new Promise((resolve, reject) => {
  wasm.onload((err) => {
    // istanbul ignore next
    if (err) { return reject(err) }
    resolve()
  })
})

function pointer(offset) {
  return wasm.exports.__heap_base + (offset || 0)
}

function deref(offset) {
  return Buffer.from(memory.buffer).slice(offset)
}

function grow(size) {
  const needed = Math.ceil(Math.abs(size - memory.buffer.byteLength) / BYTES_PER_PAGE)
  memory.grow(Math.max(0, needed))
}

function audit(size) {
  const pages = memory.buffer.byteLength / BYTES_PER_PAGE
  const needed = Math.floor((memory.buffer.byteLength + size) / BYTES_PER_PAGE)

  if (size && needed > pages) {
    grow(size)
  }

  return Buffer.from(memory.buffer)
}

function toBuffer(buffer, size, offset) {
  // istanbul ignore next
  if (!Buffer.isBuffer(buffer)) {
    return Buffer.alloc(size)
  } else {
    // istanbul ignore next
    return buffer.slice(offset || 0)
  }
}

async function ready(callback) {
  if ('function' === typeof callback) {
    try {
      await promise
    } catch (err) {
      // istanbul ignore next
      return void callback(err)
    }

    callback(null)
  }
  return promise
}

function encode(number, output, offset) {
  assert(wasm.exports, WASM_NOT_LOADED_ERR)

  const outputPointer = pointer()
  const size = encodingLength(number)
  const buffer = toBuffer(output, size, offset)

  audit(size)

  wasm.exports.varint_encode(number, outputPointer)

  deref(outputPointer).copy(buffer)

  return buffer
}

function decode(input, offset) {
  assert(wasm.exports, WASM_NOT_LOADED_ERR)

  audit(input.length)

  const inputPointer = pointer()
  Buffer.from(input).copy(deref(inputPointer))
  return wasm.exports.varint_decode(inputPointer)
}

function encodingLength(number) {
  assert(wasm.exports, WASM_NOT_LOADED_ERR)
  return wasm.exports.varint_encoding_length(number)
}

module.exports = {
  encodingLength,
  encode,
  decode,
  ready,
}
