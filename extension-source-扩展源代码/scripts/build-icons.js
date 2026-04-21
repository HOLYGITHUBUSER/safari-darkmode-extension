#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const src = path.resolve(__dirname, '..', 'icon.svg');
const outDir = path.resolve(__dirname, '..', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const sizes = [16, 48, 128];
const svg = fs.readFileSync(src);

Promise.all(sizes.map(size =>
  sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outDir, `icon${size}.png`))
    .then(() => console.log(`✓ icon${size}.png`))
)).catch(err => { console.error(err); process.exit(1); });
