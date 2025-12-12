const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const raw = fs.readFileSync(inputPath, 'utf8');

if (!isMainThread) {
  const { shapes, regions } = workerData;
  const count = countFits(shapes, regions);
  parentPort.postMessage({ count });
} else {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

async function main() {
  const { shapes, regions } = parseInput(raw);
  const sequentialThreshold = 8;
  const cpuCount = Math.max(1, os.cpus().length | 0);
  const workerCount = Math.min(cpuCount, regions.length, 8);

  if (workerCount <= 1 || regions.length < sequentialThreshold) {
    const fitCount = countFits(shapes, regions);
    console.log(String(fitCount));
    return;
  }

  const chunkSize = Math.ceil(regions.length / workerCount);
  const promises = [];
  for (let i = 0; i < workerCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, regions.length);
    if (start >= end) break;
    const chunk = regions.slice(start, end);
    promises.push(runWorker({ shapes, regions: chunk }));
  }
  const results = await Promise.all(promises);
  const fitCount = results.reduce((sum, value) => sum + value, 0);
  console.log(String(fitCount));
}

function runWorker(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: payload });
    worker.on('message', msg => resolve(msg.count));
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

function countFits(shapes, regions) {
  let fitCount = 0;
  for (const region of regions) {
    if (canFitRegion(region, shapes)) {
      fitCount += 1;
    }
  }
  return fitCount;
}

function parseInput(raw) {
  const text = raw.replace(/\r/g, '');
  const lines = text.split('\n');
  let idx = 0;
  const shapeGrids = [];

  while (idx < lines.length) {
    const header = lines[idx].trim();
    if (header === '') {
      idx += 1;
      continue;
    }
    const match = header.match(/^(\d+):\s*$/);
    if (!match) break;
    const shapeIndex = Number(match[1]);
    idx += 1;
    const grid = [];
    while (idx < lines.length && lines[idx].trim() !== '') {
      grid.push(lines[idx]);
      idx += 1;
    }
    shapeGrids[shapeIndex] = grid;
    while (idx < lines.length && lines[idx].trim() === '') {
      idx += 1;
    }
  }

  if (shapeGrids.length === 0) {
    throw new Error('No shape definitions found');
  }
  for (let i = 0; i < shapeGrids.length; i++) {
    if (!shapeGrids[i]) {
      throw new Error(`Missing shape definition for index ${i}`);
    }
  }

  const shapes = shapeGrids.map((grid, index) => buildShape(index, grid));
  const regions = [];

  for (; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (line === '') continue;
    const match = line.match(/^(\d+)x(\d+):\s*(.*)$/);
    if (!match) {
      throw new Error(`Invalid region line: ${line}`);
    }
    const width = Number(match[1]);
    const height = Number(match[2]);
    const counts = match[3].split(/\s+/).filter(Boolean).map(Number);
    if (counts.length !== shapes.length) {
      throw new Error('Region counts do not match number of shapes');
    }
    regions.push({ width, height, counts });
  }

  return { shapes, regions };
}

function buildShape(index, gridLines) {
  const cells = [];
  for (let y = 0; y < gridLines.length; y++) {
    const row = gridLines[y].trim();
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') {
        cells.push({ x, y });
      }
    }
  }
  if (cells.length === 0) {
    throw new Error(`Shape ${index} has no filled cells`);
  }
  const orientations = generateOrientations(cells);
  return { index, area: cells.length, orientations };
}

function generateOrientations(baseCells) {
  const variants = new Map();
  for (let reflect = 0; reflect < 2; reflect++) {
    for (let rot = 0; rot < 4; rot++) {
      const transformed = baseCells.map(({ x, y }) => {
        let tx = x;
        let ty = y;
        if (reflect) tx = -tx;
        for (let r = 0; r < rot; r++) {
          const nx = -ty;
          const ny = tx;
          tx = nx;
          ty = ny;
        }
        return { x: tx, y: ty };
      });
      const normalized = normalize(transformed);
      const key = normalized.map(c => `${c.x},${c.y}`).join('|');
      if (!variants.has(key)) {
        let maxX = 0;
        let maxY = 0;
        for (const cell of normalized) {
          if (cell.x > maxX) maxX = cell.x;
          if (cell.y > maxY) maxY = cell.y;
        }
        variants.set(key, {
          cells: normalized,
          width: maxX + 1,
          height: maxY + 1,
        });
      }
    }
  }
  return Array.from(variants.values());
}

function normalize(cells) {
  let minX = Infinity;
  let minY = Infinity;
  for (const cell of cells) {
    if (cell.x < minX) minX = cell.x;
    if (cell.y < minY) minY = cell.y;
  }
  return cells
    .map(cell => ({ x: cell.x - minX, y: cell.y - minY }))
    .sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

function canFitRegion(region, shapes) {
  const { width, height, counts } = region;
  const area = width * height;
  const shapesUsed = [];
  let requiredArea = 0;
  let totalPieces = 0;
  for (let i = 0; i < counts.length; i++) {
    const count = counts[i];
    if (count > 0) {
      shapesUsed.push(i);
      requiredArea += count * shapes[i].area;
      totalPieces += count;
    }
  }
  if (requiredArea > area) {
    return false;
  }
  if (totalPieces === 0) {
    return true;
  }

  const totalCells = area;
  const cellMasks = Array.from({ length: totalCells }, (_, idx) => 1n << BigInt(idx));
  const usefulCells = new Uint8Array(totalCells);
  const placements = [];
  const placementsPerShape = new Array(shapes.length).fill(0);
  const cellToPlacements = Array.from({ length: totalCells }, () => []);

  for (const shapeIdx of shapesUsed) {
    const shape = shapes[shapeIdx];
    for (const orient of shape.orientations) {
      if (orient.width > width || orient.height > height) continue;
      for (let y = 0; y <= height - orient.height; y++) {
        for (let x = 0; x <= width - orient.width; x++) {
          const placementCells = new Array(orient.cells.length);
          let mask = 0n;
          for (let i = 0; i < orient.cells.length; i++) {
            const cell = orient.cells[i];
            const nx = x + cell.x;
            const ny = y + cell.y;
            const cellIndex = ny * width + nx;
            placementCells[i] = cellIndex;
            mask |= cellMasks[cellIndex];
          }
          const placementIdx = placements.length;
          placements.push({ shapeIdx, mask });
          placementsPerShape[shapeIdx] += 1;
          for (const cellIndex of placementCells) {
            cellToPlacements[cellIndex].push(placementIdx);
            usefulCells[cellIndex] = 1;
          }
        }
      }
    }
    if (placementsPerShape[shapeIdx] < counts[shapeIdx]) {
      return false;
    }
  }

  const remaining = counts.slice();
  const memo = new Map();
  const MEMO_LIMIT = 6;

  function selectCell(occMask) {
    let bestCell = -1;
    let bestOptions = Infinity;
    for (let cell = 0; cell < totalCells; cell++) {
      if (!usefulCells[cell]) continue;
      if ((occMask & cellMasks[cell]) !== 0n) continue;
      let options = 0;
      for (const placementIdx of cellToPlacements[cell]) {
        const placement = placements[placementIdx];
        if (remaining[placement.shapeIdx] === 0) continue;
        if ((placement.mask & occMask) !== 0n) continue;
        options += 1;
        if (options >= bestOptions) break;
      }
      if (options === 0) {
        continue;
      }
      if (options < bestOptions) {
        bestOptions = options;
        bestCell = cell;
        if (bestOptions === 1) break;
      }
    }
    return bestCell;
  }

  function dfs(occMask, piecesLeft) {
    if (piecesLeft === 0) {
      return true;
    }

    let cache = null;
    let countsKey = null;
    if (piecesLeft <= MEMO_LIMIT) {
      countsKey = remaining.join(',');
      cache = memo.get(countsKey);
      if (!cache) {
        cache = new Map();
        memo.set(countsKey, cache);
      }
      if (cache.has(occMask)) {
        return cache.get(occMask);
      }
    }

    const cell = selectCell(occMask);
    if (cell === -1) {
      if (cache) cache.set(occMask, false);
      return false;
    }

    for (const placementIdx of cellToPlacements[cell]) {
      const placement = placements[placementIdx];
      const shapeIdx = placement.shapeIdx;
      if (remaining[shapeIdx] === 0) continue;
      if ((placement.mask & occMask) !== 0n) continue;
      remaining[shapeIdx] -= 1;
      if (dfs(occMask | placement.mask, piecesLeft - 1)) {
        if (cache) cache.set(occMask, true);
        remaining[shapeIdx] += 1;
        return true;
      }
      remaining[shapeIdx] += 1;
    }

    if (cache) cache.set(occMask, false);
    return false;
  }

  return dfs(0n, totalPieces);
}
