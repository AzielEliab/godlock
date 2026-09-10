/**
 * Byte-mode QR SVG for AZL-DONATE-1.0 payment URIs.
 * Generated on the Worker. No network, no KV. Author: Aziel Eliab.
 */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGf() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) {
  if (!a || !b) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGenerator(ecCount) {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data, ecCount) {
  const gen = rsGenerator(ecCount);
  const out = new Array(ecCount).fill(0);
  for (const byte of data) {
    const factor = byte ^ out[0];
    out.shift();
    out.push(0);
    if (!factor) continue;
    for (let i = 0; i < gen.length - 1; i++) {
      out[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return out;
}

/** ECC-M capacity and block layout for versions 1–6 (ISO/IEC 18004). */
const VERSIONS = {
  1: { size: 21, data: 16, ec: 10, blocks: [[1, 16, 10]], align: [] },
  2: { size: 25, data: 28, ec: 16, blocks: [[1, 28, 16]], align: [18] },
  3: { size: 29, data: 44, ec: 26, blocks: [[1, 44, 26]], align: [22] },
  4: { size: 33, data: 64, ec: 18, blocks: [[2, 32, 18]], align: [26] },
  5: { size: 37, data: 86, ec: 24, blocks: [[2, 43, 24]], align: [30] },
  6: { size: 41, data: 108, ec: 16, blocks: [[4, 27, 16]], align: [34] },
};

function chooseVersion(byteLen) {
  const overhead = 2;
  for (const v of [1, 2, 3, 4, 5, 6]) {
    if (byteLen + overhead + 1 <= VERSIONS[v].data) return v;
  }
  throw new Error("donate QR payload exceeds version 6 M");
}

function bitsFromBytes(bytes) {
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  return bits;
}

function buildDataBits(text, version) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const spec = VERSIONS[version];
  let bits = "0100";
  bits += bytes.length.toString(2).padStart(8, "0");
  bits += bitsFromBytes(bytes);
  const capacity = spec.data * 8;
  const term = Math.min(4, capacity - bits.length);
  bits += "0".repeat(term);
  while (bits.length % 8) bits += "0";
  const pad = ["11101100", "00010001"];
  let i = 0;
  while (bits.length < capacity) {
    bits += pad[i % 2];
    i++;
  }
  return bits.slice(0, capacity);
}

function bitsToCodewords(bits) {
  const out = [];
  for (let i = 0; i < bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return out;
}

function interleave(dataCw, spec) {
  const blocks = [];
  let offset = 0;
  for (const [count, dataLen, ecLen] of spec.blocks) {
    for (let i = 0; i < count; i++) {
      const data = dataCw.slice(offset, offset + dataLen);
      offset += dataLen;
      blocks.push({ data, ec: rsEncode(data, ecLen) });
    }
  }
  const maxData = Math.max(...blocks.map((b) => b.data.length));
  const maxEc = Math.max(...blocks.map((b) => b.ec.length));
  const out = [];
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.data.length) out.push(b.data[i]);
  }
  for (let i = 0; i < maxEc; i++) {
    for (const b of blocks) if (i < b.ec.length) out.push(b.ec[i]);
  }
  return out;
}

function makeGrid(size) {
  const grid = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
  return { grid, reserved };
}

function setModule(grid, reserved, r, c, val, reserve) {
  if (r < 0 || c < 0 || r >= grid.length || c >= grid.length) return;
  grid[r][c] = val ? 1 : 0;
  if (reserve) reserved[r][c] = true;
}

function placeFinder(grid, reserved, r, c) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= grid.length || cc >= grid.length) continue;
      const on = dr === -1 || dr === 7 || dc === -1 || dc === 7
        ? 0
        : (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
      setModule(grid, reserved, rr, cc, on, true);
    }
  }
}

function placeAlign(grid, reserved, positions) {
  const coords = [6].concat(positions);
  for (const r of coords) {
    for (const c of coords) {
      if ((r === 6 && c === 6) || (r === 6 && c === grid.length - 7) || (r === grid.length - 7 && c === 6)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const on = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setModule(grid, reserved, r + dr, c + dc, on, true);
        }
      }
    }
  }
}

function placeTimingAndDark(grid, reserved, version) {
  const size = grid.length;
  for (let i = 0; i < size; i++) {
    if (!reserved[6][i]) setModule(grid, reserved, 6, i, i % 2 === 0, true);
    if (!reserved[i][6]) setModule(grid, reserved, i, 6, i % 2 === 0, true);
  }
  setModule(grid, reserved, size - 8, 8, 1, true);
  for (let i = 0; i < 8; i++) {
    setModule(grid, reserved, i, 8, grid[i][8] || 0, true);
    setModule(grid, reserved, 8, i, grid[8][i] || 0, true);
    setModule(grid, reserved, size - 1 - i, 8, grid[size - 1 - i][8] || 0, true);
    setModule(grid, reserved, 8, size - 1 - i, grid[8][size - 1 - i] || 0, true);
  }
  setModule(grid, reserved, 8, 8, grid[8][8] || 0, true);
  void version;
}

function maskBit(mask, r, c) {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return false;
  }
}

function placeData(grid, reserved, codewords, mask) {
  const size = grid.length;
  const bits = bitsFromBytes(codewords);
  let i = 0;
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let n = 0; n < size; n++) {
      const row = up ? size - 1 - n : n;
      for (const c of [col, col - 1]) {
        if (reserved[row][c]) continue;
        const bit = i < bits.length ? bits[i] === "1" : false;
        i++;
        grid[row][c] = (bit !== maskBit(mask, row, c)) ? 1 : 0;
      }
    }
    up = !up;
  }
}

const FORMAT_MASK = 0x5412;
const ECC_M = 0;

function formatBits(mask) {
  let bits = (ECC_M << 3) | mask;
  let d = bits << 10;
  const gen = 0x537;
  for (let i = 14; i >= 10; i--) {
    if ((d >> i) & 1) d ^= gen << (i - 10);
  }
  return ((bits << 10) | d) ^ FORMAT_MASK;
}

function placeFormat(grid, reserved, mask) {
  const size = grid.length;
  const bits = formatBits(mask);
  const seq = [];
  for (let i = 14; i >= 0; i--) seq.push((bits >> i) & 1);
  const mapA = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  const mapB = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];
  for (let i = 0; i < 15; i++) {
    setModule(grid, reserved, mapA[i][0], mapA[i][1], seq[i], true);
    setModule(grid, reserved, mapB[i][0], mapB[i][1], seq[i], true);
  }
}

function penalty(grid) {
  const size = grid.length;
  let score = 0;
  for (let r = 0; r < size; r++) {
    let run = 1;
    for (let c = 1; c < size; c++) {
      if (grid[r][c] === grid[r][c - 1]) run++;
      else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) score += 3 + (run - 5);
  }
  for (let c = 0; c < size; c++) {
    let run = 1;
    for (let r = 1; r < size; r++) {
      if (grid[r][c] === grid[r - 1][c]) run++;
      else {
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
    }
    if (run >= 5) score += 3 + (run - 5);
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
    }
  }
  const finder = /1011101/;
  for (let r = 0; r < size; r++) {
    const row = grid[r].join("");
    if (finder.test(row)) score += 40;
    let col = "";
    for (let c = 0; c < size; c++) col += grid[c][r];
    if (finder.test(col)) score += 40;
  }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c]) dark++;
  const percent = (dark * 100) / (size * size);
  score += Math.abs(percent - 50) / 5 * 10;
  return score;
}

function buildGrid(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = chooseVersion(bytes.length);
  const spec = VERSIONS[version];
  const dataCw = bitsToCodewords(buildDataBits(text, version));
  const codewords = interleave(dataCw, spec);
  let best = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const { grid, reserved } = makeGrid(spec.size);
    placeFinder(grid, reserved, 0, 0);
    placeFinder(grid, reserved, 0, spec.size - 7);
    placeFinder(grid, reserved, spec.size - 7, 0);
    placeAlign(grid, reserved, spec.align);
    placeTimingAndDark(grid, reserved, version);
    placeFormat(grid, reserved, mask);
    placeData(grid, reserved, codewords, mask);
    placeFormat(grid, reserved, mask);
    const score = penalty(grid);
    if (score < bestScore) {
      bestScore = score;
      best = grid;
    }
  }
  return best;
}

export function qrSvg(text, { size = 128, label = "Payment URI QR" } = {}) {
  const payload = String(text || "");
  if (!payload) return "";
  const grid = buildGrid(payload);
  const n = grid.length;
  const quiet = 4;
  const dim = n + quiet * 2;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${size}" height="${size}" role="img" aria-label="${escapeAttr(label)}">`,
    `<rect width="${dim}" height="${dim}" fill="#efe6d6"/>`,
  ];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c]) {
        parts.push(`<rect x="${c + quiet}" y="${r + quiet}" width="1" height="1" fill="#12100c"/>`);
      }
    }
  }
  parts.push("</svg>");
  return parts.join("");
}

function escapeAttr(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
