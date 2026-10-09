/**
 * saveCodec.js
 * Handles decoding and encoding of Genesis 3 Part 2 save files (.sav).
 * The save format uses simple bitwise NOT (byte ^ 0xFF) with no compression or checksum.
 */

/**
 * Decode raw .sav buffer (Invert all bytes)
 * @param {ArrayBuffer} buffer 
 * @returns {Uint8Array} Decoded byte array
 */
export function decodeSaveBuffer(buffer) {
  const src = new Uint8Array(buffer);
  const len = src.byteLength;
  const decoded = new Uint8Array(len);

  // Fast 32-bit chunk invert for performance
  const u32Count = Math.floor(len / 4);
  const src32 = new Uint32Array(buffer, 0, u32Count);
  const dec32 = new Uint32Array(decoded.buffer, 0, u32Count);

  for (let i = 0; i < u32Count; i++) {
    dec32[i] = ~src32[i] >>> 0;
  }

  // Handle remaining bytes
  const remainderStart = u32Count * 4;
  for (let i = remainderStart; i < len; i++) {
    decoded[i] = src[i] ^ 0xFF;
  }

  return decoded;
}

/**
 * Calculate Genesis 3 Part 2 save file checksum.
 * As reverse engineered from G3PartII.dll (function at 0x10049F30):
 * For .sav files:
 *   sum = 0
 *   for i = 0 to length - 3:
 *     mult = 2 * (i & 3) + 3;
 *     sum = (sum + rawEncryptedBytes[i] * mult) % 32000;
 *   checksum is stored as 16-bit signed integer in the last 2 bytes.
 * @param {Uint8Array} rawEncryptedBytes 
 * @returns {number} 16-bit checksum (0 - 31999)
 */
export function calculateSaveChecksum(rawEncryptedBytes) {
  const n = rawEncryptedBytes.length - 2;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const mult = 2 * (i & 3) + 3;
    sum = (sum + rawEncryptedBytes[i] * mult) % 32000;
  }
  return sum;
}

/**
 * Update save file checksum in-place at the last 2 bytes.
 * @param {Uint8Array} rawEncryptedBytes 
 * @returns {Uint8Array} Updated buffer
 */
export function updateSaveChecksum(rawEncryptedBytes) {
  if (rawEncryptedBytes.length < 2) return rawEncryptedBytes;
  const checksum = calculateSaveChecksum(rawEncryptedBytes);
  const n = rawEncryptedBytes.length - 2;
  rawEncryptedBytes[n] = checksum & 0xFF;
  rawEncryptedBytes[n + 1] = (checksum >> 8) & 0xFF;
  return rawEncryptedBytes;
}

/**
 * Encode raw data back to .sav format (Invert all bytes) and inject correct checksum
 * @param {Uint8Array} decodedBytes 
 * @returns {Uint8Array} Encoded save bytes with valid checksum ready for writing to disk
 */
export function encodeSaveBuffer(decodedBytes) {
  const encoded = decodeSaveBuffer(decodedBytes.buffer);
  return updateSaveChecksum(encoded);
}

/**
 * Read little-endian 16-bit integer
 */
export function readUint16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

/**
 * Write little-endian 16-bit integer
 */
export function writeUint16(bytes, offset, value) {
  bytes[offset] = value & 0xFF;
  bytes[offset + 1] = (value >> 8) & 0xFF;
}

/**
 * Read little-endian 32-bit integer
 */
export function readUint32(bytes, offset) {
  return (
    (bytes[offset]) |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    ((bytes[offset + 3] << 24) >>> 0)
  );
}

/**
 * Write little-endian 32-bit integer
 */
export function writeUint32(bytes, offset, value) {
  bytes[offset] = value & 0xFF;
  bytes[offset + 1] = (value >> 8) & 0xFF;
  bytes[offset + 2] = (value >> 16) & 0xFF;
  bytes[offset + 3] = (value >> 24) & 0xFF;
}
