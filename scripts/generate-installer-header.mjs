import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const W = 150;
const H = 57;

// Brand colors
const BG = [0xFC, 0xF8, 0xFF];     // #FFF8FC BGR
const ACCENT = [0xE6, 0xA9, 0xC9]; // #C9A9E6 BGR
const ACCENT_LIGHT = [0xF0, 0xD8, 0xE8]; // lighter BGR
const WHITE = [0xFF, 0xFF, 0xFF];

// Check if a pixel is near the star shape (centered at ~34,29, ~24px wide)
function isStarPixel(x, y) {
  const cx = 34, cy = 29, r = 14;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > r) return 0;
  // Simple star: outer ring inner fill
  if (dist < r * 0.4) return 1;    // inner circle
  if (dist > r * 0.75) return 2;   // outer ring
  return 0;
}

// Check if pixel is in the decorative line at bottom
function isBottomLine(y) {
  return y >= H - 3 && y < H - 1;
}

// Check if pixel is in the gradient sidebar (right 20px)
function isSidebar(x) {
  return x >= W - 20;
}

const pixels = Buffer.alloc(W * H * 3, 0);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    let color = BG.slice();

    if (isBottomLine(y)) {
      // Decorative bottom line: accent color
      color = ACCENT.slice();
    } else if (isStarPixel(x, y) === 1) {
      // Inner star
      color = ACCENT.slice();
    } else if (isStarPixel(x, y) === 2) {
      // Outer star with transparency effect
      color = ACCENT_LIGHT.slice();
    } else if (isSidebar(x)) {
      // Right gradient sidebar
      const t = (x - (W - 20)) / 20;
      color = [
        Math.round(BG[0] + (ACCENT[0] - BG[0]) * t),
        Math.round(BG[1] + (ACCENT[1] - BG[1]) * t),
        Math.round(BG[2] + (ACCENT[2] - BG[2]) * t),
      ];
    }

    pixels[i] = color[0];     // B
    pixels[i + 1] = color[1]; // G
    pixels[i + 2] = color[2]; // R
  }
}

// Calculate row padding
const rowSize = Math.ceil(W * 3 / 4) * 4;
const padding = rowSize - W * 3;
const padBuffer = Buffer.alloc(padding, 0);

const pixelDataSize = rowSize * H;
const fileSize = 14 + 40 + pixelDataSize;

// BITMAPFILEHEADER (14 bytes)
const header = Buffer.alloc(14);
header.write('BM', 0, 'ascii');            // signature
header.writeUInt32LE(fileSize, 2);          // file size
header.writeUInt16LE(0, 6);                 // reserved
header.writeUInt16LE(0, 8);                 // reserved
header.writeUInt32LE(14 + 40, 10);          // data offset

// BITMAPINFOHEADER (40 bytes)
const dib = Buffer.alloc(40);
dib.writeUInt32LE(40, 0);                   // header size
dib.writeInt32LE(W, 4);                     // width
dib.writeInt32LE(H, 8);                     // height
dib.writeUInt16LE(1, 12);                   // planes
dib.writeUInt16LE(24, 14);                  // bpp
dib.writeUInt32LE(0, 16);                   // compression (none)
dib.writeUInt32LE(pixelDataSize, 20);       // image size
dib.writeInt32LE(2835, 24);                 // h resolution (72 DPI)
dib.writeInt32LE(2835, 28);                 // v resolution
dib.writeUInt32LE(0, 32);                   // colors used
dib.writeUInt32LE(0, 36);                   // important colors

// Write file
const filePath = path.join(root, 'public', 'installer-header.bmp');
const stream = fs.createWriteStream(filePath);
stream.write(header);
stream.write(dib);

// Write pixel data (bottom-up BMP: last row first)
for (let y = H - 1; y >= 0; y--) {
  const rowStart = y * W * 3;
  stream.write(pixels.slice(rowStart, rowStart + W * 3));
  if (padding > 0) stream.write(padBuffer);
}
stream.end();

await new Promise((resolve) => stream.on('finish', resolve));
console.log(`✓ Installer header BMP created: ${filePath} (${W}x${H})`);
