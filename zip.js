// Pure JS standard PKZIP builder (Store mode - method 0)
// Fully compatible with Windows Explorer, macOS Archive Utility, Linux unzip
class SimpleZip {
  constructor() {
    this.files = [];
  }

  addFile(name, content) {
    const encoder = new TextEncoder();
    const data = typeof content === 'string' ? encoder.encode(content) : new Uint8Array(content);
    this.files.push({ name, data });
  }

  // Precomputed CRC32 table
  static crc32(data) {
    let crc = 0 ^ -1;
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ SimpleZip.crcTable[(crc ^ data[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  build() {
    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    const encoder = new TextEncoder();
    const now = new Date();
    // DOS time and date
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (Math.floor(now.getSeconds() / 2));
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    for (const file of this.files) {
      const nameBytes = encoder.encode(file.name);
      const crc = SimpleZip.crc32(file.data);
      const size = file.data.length;

      // Local File Header (30 bytes + name length + data length)
      const localHeader = new Uint8Array(30 + nameBytes.length + size);
      const lv = new DataView(localHeader.buffer);

      lv.setUint32(0, 0x04034b50, true); // Local file header signature
      lv.setUint16(4, 20, true);         // Version needed to extract (2.0)
      lv.setUint16(6, 0, true);          // General purpose bit flag
      lv.setUint16(8, 0, true);          // Compression method: 0 (Store)
      lv.setUint16(10, dosTime, true);   // Last mod time
      lv.setUint16(12, dosDate, true);   // Last mod date
      lv.setUint32(14, crc, true);       // CRC-32
      lv.setUint32(18, size, true);      // Compressed size
      lv.setUint32(22, size, true);      // Uncompressed size
      lv.setUint16(26, nameBytes.length, true); // File name length
      lv.setUint16(28, 0, true);         // Extra field length
      localHeader.set(nameBytes, 30);
      localHeader.set(file.data, 30 + nameBytes.length);

      localHeaders.push(localHeader);

      // Central Directory Header (46 bytes + name length)
      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(centralHeader.buffer);

      cv.setUint32(0, 0x02014b50, true); // Central directory header signature
      cv.setUint16(4, 20, true);         // Version made by
      cv.setUint16(6, 20, true);         // Version needed
      cv.setUint16(8, 0, true);          // General purpose bit flag
      cv.setUint16(10, 0, true);         // Compression method (0)
      cv.setUint16(12, dosTime, true);   // Last mod time
      cv.setUint16(14, dosDate, true);   // Last mod date
      cv.setUint32(16, crc, true);       // CRC-32
      cv.setUint32(20, size, true);      // Compressed size
      cv.setUint32(24, size, true);      // Uncompressed size
      cv.setUint16(28, nameBytes.length, true); // File name length
      cv.setUint16(30, 0, true);         // Extra field length
      cv.setUint16(32, 0, true);         // File comment length
      cv.setUint16(34, 0, true);         // Disk number start
      cv.setUint16(36, 0, true);         // Internal file attributes
      cv.setUint32(38, 0, true);         // External file attributes
      cv.setUint32(42, offset, true);    // Relative offset of local header
      centralHeader.set(nameBytes, 46);

      centralHeaders.push(centralHeader);

      offset += localHeader.length;
    }

    const centralDirOffset = offset;
    let centralDirSize = 0;
    for (const ch of centralHeaders) centralDirSize += ch.length;

    // End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true); // EOCD signature
    ev.setUint16(4, 0, true);          // Number of this disk
    ev.setUint16(6, 0, true);          // Disk where central directory starts
    ev.setUint16(8, this.files.length, true);  // Number of central directory records on this disk
    ev.setUint16(10, this.files.length, true); // Total number of central directory records
    ev.setUint32(12, centralDirSize, true);    // Size of central directory
    ev.setUint32(16, centralDirOffset, true);  // Offset of start of central directory
    ev.setUint16(20, 0, true);                 // Comment length

    // Concatenate all
    const totalSize = offset + centralDirSize + eocd.length;
    const zipData = new Uint8Array(totalSize);
    let cur = 0;
    for (const lh of localHeaders) {
      zipData.set(lh, cur);
      cur += lh.length;
    }
    for (const ch of centralHeaders) {
      zipData.set(ch, cur);
      cur += ch.length;
    }
    zipData.set(eocd, cur);

    return zipData;
  }
}

SimpleZip.crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

if (typeof module !== 'undefined') {
  module.exports = SimpleZip;
}
