import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sizes = [256, 64, 48, 32, 16];

// Brand colors
const accent = '#C9A9E6';
const white = '#FFF8FC';

// SVG star logo matching Logo.tsx design, sized to 256x256 viewport
const starSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M46 14 C54 14 56 22 56 32 C56 42 54 50 46 50" stroke="${accent}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.3"/>
  <path d="M32 12 C38 12 42 16 44 22 C46 28 50 30 50 32 C50 34 46 36 44 42 C42 48 38 52 32 52 C26 52 22 48 20 42 C18 36 14 34 14 32 C14 30 18 28 20 22 C22 16 26 12 32 12Z" fill="${accent}" opacity="0.92"/>
  <path d="M32 18 C36 18 39 21 40 25 C41 29 44 31 44 32 C44 33 41 35 40 39 C39 43 36 46 32 46 C28 46 25 43 24 39 C23 35 20 33 20 32 C20 31 23 29 24 25 C25 21 28 18 32 18Z" fill="${white}" opacity="0.15"/>
  <path d="M26 28 C30 24 34 30 38 26" stroke="${white}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.45"/>
  <path d="M26 32 C30 36 34 31 38 36" stroke="${white}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.35"/>
  <circle cx="28" cy="22" r="1.5" fill="${white}" opacity="0.4"/>
  <circle cx="38" cy="40" r="1" fill="${white}" opacity="0.3"/>
</svg>`;

async function generateIco() {
  const publicDir = path.join(root, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Generate PNG buffers for each size
  const pngBuffers = [];
  for (const size of sizes) {
    const svg = starSvg(size);
    const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    pngBuffers.push({ size, buffer: png });
  }

  // Build ICO file manually
  // ICO header: reserved(2) + type(2) + count(2)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: ICO
  header.writeUInt16LE(pngBuffers.length, 4);  // count

  // ICO directory entries: each is 16 bytes
  const dirEntries = [];
  let imageDataOffset = 6 + pngBuffers.length * 16;

  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    const bpp = 32;
    // If size >= 256, use 0
    entry.writeUInt8(size >= 256 ? 0 : size, 0);  // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1);  // height
    entry.writeUInt8(0, 2);   // colors
    entry.writeUInt8(0, 3);   // reserved
    entry.writeUInt16LE(1, 4);   // planes
    entry.writeUInt16LE(bpp, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8);  // image size
    entry.writeUInt32LE(imageDataOffset, 12); // offset
    dirEntries.push(entry);
    imageDataOffset += buffer.length;
  }

  // Write the ICO file
  const icoPath = path.join(publicDir, 'favicon.ico');
  const stream = fs.createWriteStream(icoPath);
  stream.write(header);
  for (const entry of dirEntries) stream.write(entry);
  for (const { buffer } of pngBuffers) stream.write(buffer);
  stream.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const stats = fs.statSync(icoPath);
  console.log(`✓ ICO created: ${icoPath} (${(stats.size / 1024).toFixed(1)} KB, ${pngBuffers.length} sizes)`);

  // Also save the largest PNG as a standalone icon
  const pngPath = path.join(publicDir, 'icon-256.png');
  fs.writeFileSync(pngPath, pngBuffers.find(p => p.size === 256).buffer);
  console.log(`✓ PNG created: ${pngPath}`);
}

generateIco().catch(console.error);
