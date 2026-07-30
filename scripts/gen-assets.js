#!/usr/bin/env node
/*
 * Generate Zenitj app assets (icon, splash, adaptive-icon, favicon) as PNGs.
 * No third-party deps — a minimal PNG encoder plus simple shape rasterising.
 * Runs automatically on `npm install` (postinstall) so the assets referenced
 * by app.config.ts always exist locally and in CI, without committing binaries.
 *
 * Run manually: node scripts/gen-assets.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BG = [11, 17, 32, 255]; // #0B1120
const PRIMARY = [99, 102, 241, 255]; // #6366F1
const WHITE = [255, 255, 255, 255];
const TRANSPARENT = [0, 0, 0, 0];

function blank(w, h, color) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) row.push(color.slice());
    rows.push(row);
  }
  return rows;
}

function blend(dst, src) {
  const a = src[3] / 255;
  return [
    Math.round(src[0] * a + dst[0] * (1 - a)),
    Math.round(src[1] * a + dst[1] * (1 - a)),
    Math.round(src[2] * a + dst[2] * (1 - a)),
    Math.max(dst[3], src[3]),
  ];
}

function fillRoundedRect(px, x0, y0, x1, y1, radius, color) {
  const h = px.length;
  const w = px[0].length;
  for (let y = Math.max(0, y0); y < Math.min(h, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(w, x1); x++) {
      const cx = Math.min(Math.max(x, x0 + radius), x1 - radius);
      const cy = Math.min(Math.max(y, y0 + radius), y1 - radius);
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) {
        px[y][x] = blend(px[y][x], color);
      }
    }
  }
}

function drawThickLine(px, x0, y0, x1, y1, thickness, color) {
  const h = px.length;
  const w = px[0].length;
  const steps = Math.floor(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2) + 1;
  const r = thickness / 2;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const cx = x0 + (x1 - x0) * t;
    const cy = y0 + (y1 - y0) * t;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if (x >= 0 && x < w && y >= 0 && y < h) {
          if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) {
            px[y][x] = blend(px[y][x], color);
          }
        }
      }
    }
  }
}

function drawZ(px, cx, cy, size, thickness, color) {
  const half = size / 2;
  const left = cx - half;
  const right = cx + half;
  const top = cy - half;
  const bottom = cy + half;
  drawThickLine(px, left, top, right, top, thickness, color);
  drawThickLine(px, right, top, left, bottom, thickness, color);
  drawThickLine(px, left, bottom, right, bottom, thickness, color);
}

// --- Minimal PNG encoder ---
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tag, payload) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(payload.length, 0);
  const tagBuf = Buffer.from(tag, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tagBuf, payload])), 0);
  return Buffer.concat([len, tagBuf, payload, crcBuf]);
}

function writePng(file, px) {
  const h = px.length;
  const w = px[0].length;
  const raw = Buffer.alloc(h * (1 + w * 4));
  let o = 0;
  for (let y = 0; y < h; y++) {
    raw[o++] = 0; // filter type 0
    for (let x = 0; x < w; x++) {
      raw[o++] = px[y][x][0];
      raw[o++] = px[y][x][1];
      raw[o++] = px[y][x][2];
      raw[o++] = px[y][x][3];
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const out = Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, out);
  console.log("wrote", path.basename(file), `${w}x${h}`);
}

function makeIcon(size, bg = true, tile = true) {
  const px = blank(size, size, bg ? BG : TRANSPARENT);
  if (tile) {
    const pad = Math.round(size * 0.16);
    fillRoundedRect(px, pad, pad, size - pad, size - pad, Math.round(size * 0.16), PRIMARY);
    drawZ(px, size / 2, size / 2, size * 0.42, size * 0.075, WHITE);
  } else {
    drawZ(px, size / 2, size / 2, size * 0.5, size * 0.09, PRIMARY);
  }
  return px;
}

function makeSplash(size) {
  const px = blank(size, size, BG);
  fillRoundedRect(px, Math.round(size * 0.36), Math.round(size * 0.36),
    Math.round(size * 0.64), Math.round(size * 0.64), Math.round(size * 0.05), PRIMARY);
  drawZ(px, size / 2, size / 2, size * 0.12, size * 0.022, WHITE);
  return px;
}

function main() {
  const assets = path.join(__dirname, "..", "assets");
  fs.mkdirSync(assets, { recursive: true });
  writePng(path.join(assets, "icon.png"), makeIcon(1024));
  writePng(path.join(assets, "adaptive-icon.png"), makeIcon(1024, false, false));
  writePng(path.join(assets, "splash.png"), makeSplash(1024));
  writePng(path.join(assets, "favicon.png"), makeIcon(48));
}

try {
  main();
} catch (err) {
  // Never fail an install because of asset generation.
  console.warn("[gen-assets] skipped:", err && err.message);
}
