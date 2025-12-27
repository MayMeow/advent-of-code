---
title: "Advent of Code 2025 – Day 12"
date: 2025-12-12
tags: [aoc, advent-of-code, 2025]
---

# Advent of Code 2025 - Day 12: Christmas Tree Farm

Tetris, but make it elves. Today was all about figuring out whether oddly shaped presents could tile a given rectangle without overlaps. On paper it sounds like a straight polyomino packing question; in practice it turned into a tour through three different solvers and a bunch of benchmarking.

## Part 1 – How many regions work?
1. Parse the shape catalog once, generating all unique rotations and reflections so every piece can be dropped anywhere on the board.
2. For each region, enumerate every legal placement for each requested shape. If a shape can’t be placed at least as many times as requested, we bail out early.
3. Search for a placement combination that satisfies all quotas without overlapping.

I tried three versions of the search:

- **v1 (baseline)** – board-first DFS. I picked a shape, tried every placement, marked `board[cell] = 1`, and backtracked. It was simple but took ~17 seconds on my input.
- **v2 (conflict tracker)** – still single-threaded, but now each placement knew all other placements it blocked. Applying/removing a placement updated per-shape availability counts so the "choose the most constrained shape" heuristic stayed honest. Runtime dropped to ~5.5 seconds.
- **v3 (bitmask + workers)** – I rewrote the solver to use `BigInt` bitmasks and fanned regions out across worker threads. Surprisingly, the coordination overhead plus a more generic search pushed the runtime back up to ~15 seconds. Cool experiment, but v2 is still the champ.

Final tally: **451 regions** can fit their assigned piles of presents. The sample input still reports `2`, which was a good sanity check after each rewrite.

**Complexity:** Let `P` be the number of precomputed placements for a region and `S` the number of requested presents. Placement generation is `O(P)` and the search is exponential in `S`, but pruning by shape availability keeps the tree manageable in practice (most regions cap out under a few thousand nodes).

## Optimization Notes
- Enumerate placements once; it’s cheaper than trying to be clever mid-search.
- Track conflicts at the placement level instead of constantly rescanning the board.
- Parallelism only helped when there were enough regions per worker—otherwise the setup cost overshadowed the gains.

That’s day 12: a polyomino packing gauntlet, one satisfied region count, and a good reminder to trust profiling over gut feelings when optimizing search code.


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
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

  const totalCells = area;
  const placements = [];
  const placementsByShape = Array.from({ length: shapes.length }, () => []);
  const cellToPlacements = Array.from({ length: totalCells }, () => []);

  for (const shapeIdx of shapesUsed) {
    const shape = shapes[shapeIdx];
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
          const placementIdx = placements.length;
          placements.push({ shapeIdx, cells, blocked: 0 });
          placementsByShape[shapeIdx].push(placementIdx);
          for (const cellIndex of cells) {
            cellToPlacements[cellIndex].push(placementIdx);
          }
        }
      }
    }
    if (placementsByShape[shapeIdx].length < counts[shapeIdx]) {
      return false;
    }
  }

  const availableCounts = new Array(shapes.length).fill(0);
  for (const shapeIdx of shapesUsed) {
    availableCounts[shapeIdx] = placementsByShape[shapeIdx].length;
  }

  const remaining = counts.slice();

  function applyPlacement(placementIdx) {
    const placement = placements[placementIdx];
    for (const cell of placement.cells) {
      for (const targetIdx of cellToPlacements[cell]) {
        const target = placements[targetIdx];
        target.blocked += 1;
        if (target.blocked === 1) {
          availableCounts[target.shapeIdx] -= 1;
        }
      }
    }
  }

  function removePlacement(placementIdx) {
    const placement = placements[placementIdx];
    for (const cell of placement.cells) {
      for (const targetIdx of cellToPlacements[cell]) {
        const target = placements[targetIdx];
        if (target.blocked === 0) continue;
        target.blocked -= 1;
        if (target.blocked === 0) {
          availableCounts[target.shapeIdx] += 1;
        }
      }
    }
  }

  function selectShape() {
    let bestShape = -1;
    let bestOptions = Infinity;
    for (const shapeIdx of shapesUsed) {
      const need = remaining[shapeIdx];
      if (need === 0) continue;
      const options = availableCounts[shapeIdx];
      if (options < need) {
        return -1;
      }
      if (options < bestOptions) {
        bestOptions = options;
        bestShape = shapeIdx;
        if (bestOptions === need) {
          break;
        }
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
    const indices = placementsByShape[shapeIdx];
    for (let i = 0; i < indices.length; i++) {
      const placementIdx = indices[i];
      const placement = placements[placementIdx];
      if (placement.blocked !== 0) continue;
      applyPlacement(placementIdx);
      remaining[shapeIdx] -= 1;
      if (dfs(piecesLeft - 1)) {
        return true;
      }
      remaining[shapeIdx] += 1;
      removePlacement(placementIdx);
    }
    return false;
  }

  return dfs(totalPieces);
}
```
