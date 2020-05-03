const varint = require('./')

// wait for module to be ready if loading in a browser environment
varint.ready(() => {
  const encoded = varint.encode(64 * 1024)
  console.log(encoded) // <Buffer 80 80 04>

  const decoded = varint.decode(encoded)
  console.log(decoded) // 65536
})
