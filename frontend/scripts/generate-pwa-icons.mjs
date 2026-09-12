import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPNG(width, height, r, g, b, innerR, innerG, innerB) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // deflate
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: filter byte (0) + width * 4 bytes per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;
  const cornerRadius = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check rounded rect badge
      const dx = Math.max(Math.abs(x - cx) - (cx - cornerRadius), 0);
      const dy = Math.max(Math.abs(y - cy) - (cy - cornerRadius), 0);
      const distCorner = Math.sqrt(dx * dx + dy * dy);

      // Inner calculator area
      const inCalculator = (x >= width * 0.25 && x <= width * 0.75 && y >= height * 0.22 && y <= height * 0.78);
      const inScreen = (x >= width * 0.32 && x <= width * 0.68 && y >= height * 0.28 && y <= height * 0.42);

      if (distCorner <= cornerRadius) {
        // Gradient background
        const gradT = (x + y) / (width + height);
        const bgR = Math.round(99 * (1 - gradT) + 168 * gradT);
        const bgG = Math.round(102 * (1 - gradT) + 85 * gradT);
        const bgB = Math.round(241 * (1 - gradT) + 247 * gradT);

        if (inScreen) {
          // Greenish glowing screen
          rawData[pxOffset] = 16;
          rawData[pxOffset + 1] = 185;
          rawData[pxOffset + 2] = 129;
          rawData[pxOffset + 3] = 255;
        } else if (inCalculator) {
          // Dark calculator slate
          rawData[pxOffset] = 15;
          rawData[pxOffset + 1] = 23;
          rawData[pxOffset + 2] = 42;
          rawData[pxOffset + 3] = 240;
        } else {
          rawData[pxOffset] = bgR;
          rawData[pxOffset + 1] = bgG;
          rawData[pxOffset + 2] = bgB;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Dark outer corner
        rawData[pxOffset] = 10;
        rawData[pxOffset + 1] = 14;
        rawData[pxOffset + 2] = 23;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crc]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const outDir = 'f:/krish/EMI_Calculator/frontend/public/icons';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 192x192
const p192 = createPNG(192, 192);
fs.writeFileSync(path.join(outDir, 'icon-192x192.png'), p192);

// 512x512
const p512 = createPNG(512, 512);
fs.writeFileSync(path.join(outDir, 'icon-512x512.png'), p512);
fs.writeFileSync(path.join(outDir, 'maskable-icon-512x512.png'), p512);

// Apple touch icon 180x180
const pApple = createPNG(180, 180);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), pApple);

console.log('All PWA PNG icons generated successfully!');
