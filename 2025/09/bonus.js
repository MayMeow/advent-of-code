const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'sample.txt');
const paddingX = Number(process.env.BONUS_PAD_X ?? 2);
const paddingY = Number(process.env.BONUS_PAD_Y ?? 1);
const maxRenderCells = Number(process.env.BONUS_MAX_CELLS ?? 80000);

function parsePoints(raw) {
  return raw
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [xText, yText] = line.split(',');
      const x = Number(xText);
      const y = Number(yText);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`Invalid coordinate: ${line}`);
      }
      return { x, y };
    });
}

function key(x, y) {
  return `${x},${y}`;
}

function buildBoundarySet(points) {
  const boundary = new Set();
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    if (current.x === next.x) {
      const start = Math.min(current.y, next.y);
      const end = Math.max(current.y, next.y);
      for (let y = start; y <= end; y += 1) {
        boundary.add(key(current.x, y));
      }
    } else if (current.y === next.y) {
      const start = Math.min(current.x, next.x);
      const end = Math.max(current.x, next.x);
      for (let x = start; x <= end; x += 1) {
        boundary.add(key(x, current.y));
      }
    } else {
      throw new Error('Input must form axis-aligned segments.');
    }
  }
  return boundary;
}

function pointInsidePolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i, i += 1) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function buildAllowedSet(points) {
  const boundary = buildBoundarySet(points);
  const allowed = new Set(boundary);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const cellCount = width * height;
  if (cellCount > maxRenderCells) {
    const error = new Error(`Render grid too large (${cellCount} cells > limit ${maxRenderCells}).`);
    error.code = 'GRID_TOO_LARGE';
    error.details = { cellCount, width, height };
    throw error;
  }

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      const k = key(x, y);
      if (allowed.has(k)) {
        continue;
      }
      if (pointInsidePolygon(x + 0.5, y + 0.5, points)) {
        allowed.add(k);
      }
    }
  }

  return { allowed, bounds: { minX, maxX, minY, maxY } };
}

function rectangleWithinAllowed(allowed, rect) {
  for (let x = rect.minX; x <= rect.maxX; x += 1) {
    for (let y = rect.minY; y <= rect.maxY; y += 1) {
      if (!allowed.has(key(x, y))) {
        return false;
      }
    }
  }
  return true;
}

function findBestRectangle(points, validator) {
  let bestArea = 0n;
  let best = null;
  for (let i = 0; i < points.length - 1; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const minX = Math.min(points[i].x, points[j].x);
      const maxX = Math.max(points[i].x, points[j].x);
      const minY = Math.min(points[i].y, points[j].y);
      const maxY = Math.max(points[i].y, points[j].y);
      const area = BigInt(maxX - minX + 1) * BigInt(maxY - minY + 1);
      if (area <= bestArea) {
        continue;
      }
      if (!validator({ minX, maxX, minY, maxY })) {
        continue;
      }
      bestArea = area;
      best = { minX, maxX, minY, maxY, a: points[i], b: points[j], area };
    }
  }
  return best;
}

function computeBounds(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs) - paddingX,
    maxX: Math.max(...xs) + paddingX,
    minY: Math.min(...ys) - paddingY,
    maxY: Math.max(...ys) + paddingY,
  };
}

function renderGrid(points, rect, options = {}) {
  const { allowed = null, label = '' } = options;
  const bounds = computeBounds(points);
  const redSet = new Set(points.map((p) => key(p.x, p.y)));
  const lines = [];
  for (let y = bounds.maxY; y >= bounds.minY; y -= 1) {
    let row = '';
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const k = key(x, y);
      let cell = '.';
      if (allowed?.has(k)) {
        cell = 'X';
      }
      if (redSet.has(k)) {
        cell = '#';
      }
      if (
        rect &&
        x >= rect.minX &&
        x <= rect.maxX &&
        y >= rect.minY &&
        y <= rect.maxY
      ) {
        cell = redSet.has(k) ? '#' : 'O';
      }
      row += cell;
    }
    lines.push(row);
  }
  if (label) {
    return `${label}\n${lines.join('\n')}`;
  }
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const raw = fs.readFileSync(inputPath, 'utf8').trim();
  if (!raw) {
    console.error('Input is empty.');
    process.exitCode = 1;
    return;
  }

  const points = parsePoints(raw);
  const part1Rect = findBestRectangle(points, () => true);
  if (!part1Rect) {
    console.log('No rectangle could be formed from the given red tiles.');
    return;
  }

  console.log('Part 1 rectangle');
  console.log(`Area: ${part1Rect.area.toString()} between (${part1Rect.a.x},${part1Rect.a.y}) and (${part1Rect.b.x},${part1Rect.b.y})`);
  console.log(renderGrid(points, part1Rect));
  console.log('');

  try {
    const { allowed } = buildAllowedSet(points);
    const part2Rect = findBestRectangle(points, (rect) => rectangleWithinAllowed(allowed, rect));
    if (part2Rect) {
      console.log('Part 2 rectangle (restricted to red/green tiles)');
      console.log(`Area: ${part2Rect.area.toString()} between (${part2Rect.a.x},${part2Rect.a.y}) and (${part2Rect.b.x},${part2Rect.b.y})`);
      console.log(renderGrid(points, part2Rect, { allowed, label: '' }));
    } else {
      console.log('No rectangle satisfies the red/green constraint.');
    }
  } catch (error) {
    if (error.code === 'GRID_TOO_LARGE') {
      console.warn('Part 2 diagram skipped:', error.message);
      console.warn('Increase BONUS_MAX_CELLS to override or run against the sample input.');
    } else {
      throw error;
    }
  }
}

main();
