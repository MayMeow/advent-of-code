const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

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

function buildPerimeter(points) {
  const segments = [];
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    if (current.x === next.x) {
      const yStart = Math.min(current.y, next.y);
      const yEnd = Math.max(current.y, next.y);
      for (let y = yStart; y <= yEnd; y += 1) {
        segments.push({ x: current.x, y });
      }
    } else if (current.y === next.y) {
      const xStart = Math.min(current.x, next.x);
      const xEnd = Math.max(current.x, next.x);
      for (let x = xStart; x <= xEnd; x += 1) {
        segments.push({ x, y: current.y });
      }
    } else {
      throw new Error('Adjacent points must share row or column.');
    }
  }
  return segments;
}

function computeBounds(coordSet) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  coordSet.forEach((key) => {
    const [xText, yText] = key.split(',');
    const x = Number(xText);
    const y = Number(yText);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  return { minX, maxX, minY, maxY };
}

function floodFill(polySet, bounds) {
  const minX = bounds.minX - 1;
  const maxX = bounds.maxX + 1;
  const minY = bounds.minY - 1;
  const maxY = bounds.maxY + 1;

  const queue = [[minX, minY]];
  const visited = new Set();
  visited.add(`${minX},${minY}`);

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
      const key = `${nx},${ny}`;
      if (polySet.has(key) || visited.has(key)) continue;
      visited.add(key);
      queue.push([nx, ny]);
    }
  }

  const interior = new Set();
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      const key = `${x},${y}`;
      if (!visited.has(key)) {
        interior.add(key);
      }
    }
  }
  return interior;
}

function computeAllowed(points) {
  const perimeter = buildPerimeter(points);
  const allowed = new Set(perimeter.map(({ x, y }) => `${x},${y}`));
  const bounds = computeBounds(allowed);
  const interior = floodFill(allowed, bounds);
  interior.forEach((key) => allowed.add(key));
  return allowed;
}

function maxArea(points, allowed) {
  let best = 0n;
  for (let i = 0; i < points.length - 1; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const minX = Math.min(points[i].x, points[j].x);
      const maxX = Math.max(points[i].x, points[j].x);
      const minY = Math.min(points[i].y, points[j].y);
      const maxY = Math.max(points[i].y, points[j].y);
      let valid = true;
      for (let x = minX; x <= maxX && valid; x += 1) {
        for (let y = minY; y <= maxY; y += 1) {
          if (!allowed.has(`${x},${y}`)) {
            valid = false;
            break;
          }
        }
      }
      if (valid) {
        const area = BigInt(maxX - minX + 1) * BigInt(maxY - minY + 1);
        if (area > best) {
          best = area;
        }
      }
    }
  }
  return best;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const raw = fs.readFileSync(inputPath, 'utf8').trim();
  if (!raw) {
    console.log('0');
    return;
  }

  const points = parsePoints(raw);
  const allowed = computeAllowed(points);
  const answer = maxArea(points, allowed);
  console.log(answer.toString());
}

main();
