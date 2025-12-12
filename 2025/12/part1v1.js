const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const raw = fs.readFileSync(inputPath, 'utf8');

const { shapes, regions } = parseInput(raw);
let fitCount = 0;
for (const region of regions) {
  if (canFitRegion(region, shapes)) {
    fitCount += 1;
  }
}
console.log(String(fitCount));

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

  const placementsByShape = Array.from({ length: shapes.length }, () => []);
  for (const shapeIdx of shapesUsed) {
    const shape = shapes[shapeIdx];
    const placements = placementsByShape[shapeIdx];
    for (const orient of shape.orientations) {
      if (orient.width > width || orient.height > height) continue;
      for (let y = 0; y <= height - orient.height; y++) {
        for (let x = 0; x <= width - orient.width; x++) {
          const cells = new Array(orient.cells.length);
          for (let i = 0; i < orient.cells.length; i++) {
            const cell = orient.cells[i];
            const nx = x + cell.x;
            const ny = y + cell.y;
            cells[i] = ny * width + nx;
          }
          placements.push({ cells });
        }
      }
    }
    if (placements.length < counts[shapeIdx]) {
      return false;
    }
  }

  const board = new Uint8Array(area);
  const remaining = counts.slice();

  function selectShape() {
    let bestShape = -1;
    let bestOptions = Infinity;
    for (const shapeIdx of shapesUsed) {
      if (remaining[shapeIdx] === 0) continue;
      let options = 0;
      const placements = placementsByShape[shapeIdx];
      for (let i = 0; i < placements.length; i++) {
        const placement = placements[i];
        let fits = true;
        for (let j = 0; j < placement.cells.length; j++) {
          if (board[placement.cells[j]]) {
            fits = false;
            break;
          }
        }
        if (fits) {
          options += 1;
          if (options >= bestOptions) break;
        }
      }
      if (options === 0) {
        return -1;
      }
      if (options < bestOptions) {
        bestOptions = options;
        bestShape = shapeIdx;
        if (bestOptions === 1) break;
      }
    }
    return bestShape;
  }

  function dfs(piecesLeft) {
    if (piecesLeft === 0) {
      return true;
    }
    const shapeIdx = selectShape();
    if (shapeIdx === -1) {
      return false;
    }
    const placements = placementsByShape[shapeIdx];
    for (let i = 0; i < placements.length; i++) {
      const placement = placements[i];
      let fits = true;
      for (let j = 0; j < placement.cells.length; j++) {
        if (board[placement.cells[j]]) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;
      for (const cell of placement.cells) {
        board[cell] = 1;
      }
      remaining[shapeIdx] -= 1;
      if (dfs(piecesLeft - 1)) {
        return true;
      }
      remaining[shapeIdx] += 1;
      for (const cell of placement.cells) {
        board[cell] = 0;
      }
    }
    return false;
  }

  return dfs(totalPieces);
}
