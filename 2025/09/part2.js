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

function buildSegments(points) {
  const segments = [];
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    segments.push({ x1: current.x, y1: current.y, x2: next.x, y2: next.y });
  }
  return segments;
}

function buildCoordinateInfo(points) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const { x, y } of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const xSet = new Set([minX - 1, maxX + 2]);
  const ySet = new Set([minY - 1, maxY + 2]);

  for (const { x, y } of points) {
    xSet.add(x);
    xSet.add(x + 1);
    ySet.add(y);
    ySet.add(y + 1);
  }

  const xVals = Array.from(xSet).sort((a, b) => a - b);
  const yVals = Array.from(ySet).sort((a, b) => a - b);

  const xIndex = new Map();
  xVals.forEach((value, idx) => xIndex.set(value, idx));
  const yIndex = new Map();
  yVals.forEach((value, idx) => yIndex.set(value, idx));

  return { xVals, yVals, xIndex, yIndex };
}

function markWalkway(segments, coordInfo) {
  const { xVals, yVals, xIndex, yIndex } = coordInfo;
  const width = xVals.length - 1;
  const height = yVals.length - 1;
  const walkway = Array.from({ length: width }, () => Array(height).fill(false));

  for (const segment of segments) {
    if (segment.x1 === segment.x2) {
      const x = segment.x1;
      const startY = Math.min(segment.y1, segment.y2);
      const endY = Math.max(segment.y1, segment.y2);
      const xStart = xIndex.get(x);
      const xEnd = xIndex.get(x + 1);
      const yStart = yIndex.get(startY);
      const yEnd = yIndex.get(endY + 1);
      for (let i = xStart; i < xEnd; i += 1) {
        for (let j = yStart; j < yEnd; j += 1) {
          walkway[i][j] = true;
        }
      }
    } else if (segment.y1 === segment.y2) {
      const y = segment.y1;
      const startX = Math.min(segment.x1, segment.x2);
      const endX = Math.max(segment.x1, segment.x2);
      const xStart = xIndex.get(startX);
      const xEnd = xIndex.get(endX + 1);
      const yStart = yIndex.get(y);
      const yEnd = yIndex.get(y + 1);
      for (let i = xStart; i < xEnd; i += 1) {
        for (let j = yStart; j < yEnd; j += 1) {
          walkway[i][j] = true;
        }
      }
    } else {
      throw new Error('Segments must be axis-aligned.');
    }
  }

  return walkway;
}

function markOutside(blocked) {
  const width = blocked.length;
  const height = blocked[0]?.length ?? 0;
  const visited = Array.from({ length: width }, () => Array(height).fill(false));
  const queue = [];
  let head = 0;

  function enqueue(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    if (blocked[x][y] || visited[x][y]) return;
    visited[x][y] = true;
    queue.push([x, y]);
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < queue.length) {
    const [x, y] = queue[head];
    head += 1;
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (blocked[nx][ny] || visited[nx][ny]) continue;
      visited[nx][ny] = true;
      queue.push([nx, ny]);
    }
  }

  return visited;
}

function buildPrefixSums(allowed, xVals, yVals) {
  const width = allowed.length;
  const height = allowed[0]?.length ?? 0;
  const prefix = Array.from({ length: width + 1 }, () => Array(height + 1).fill(0n));

  for (let i = 0; i < width; i += 1) {
    const cellWidth = BigInt(xVals[i + 1] - xVals[i]);
    for (let j = 0; j < height; j += 1) {
      const cellHeight = BigInt(yVals[j + 1] - yVals[j]);
      const cellArea = allowed[i][j] ? cellWidth * cellHeight : 0n;
      prefix[i + 1][j + 1] =
        cellArea + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];
    }
  }

  return prefix;
}

function queryArea(prefix, xStart, xEnd, yStart, yEnd) {
  return (
    prefix[xEnd][yEnd] -
    prefix[xStart][yEnd] -
    prefix[xEnd][yStart] +
    prefix[xStart][yStart]
  );
}

function solve(points) {
  if (points.length < 2) {
    return 0n;
  }

  const segments = buildSegments(points);
  const coordInfo = buildCoordinateInfo(points);
  const walkway = markWalkway(segments, coordInfo);
  const outsideVisited = markOutside(walkway);

  const width = walkway.length;
  const height = walkway[0]?.length ?? 0;
  const allowed = Array.from({ length: width }, () => Array(height).fill(false));

  for (let i = 0; i < width; i += 1) {
    for (let j = 0; j < height; j += 1) {
      allowed[i][j] = walkway[i][j] || !outsideVisited[i][j];
    }
  }

  const prefix = buildPrefixSums(allowed, coordInfo.xVals, coordInfo.yVals);
  const { xIndex, yIndex } = coordInfo;

  let best = 0n;
  for (let i = 0; i < points.length - 1; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const xMin = Math.min(points[i].x, points[j].x);
      const xMax = Math.max(points[i].x, points[j].x);
      const yMin = Math.min(points[i].y, points[j].y);
      const yMax = Math.max(points[i].y, points[j].y);

      const totalArea = BigInt(xMax - xMin + 1) * BigInt(yMax - yMin + 1);
      const xStart = xIndex.get(xMin);
      const xEnd = xIndex.get(xMax + 1);
      const yStart = yIndex.get(yMin);
      const yEnd = yIndex.get(yMax + 1);

      const allowedArea = queryArea(prefix, xStart, xEnd, yStart, yEnd);
      if (allowedArea === totalArea && totalArea > best) {
        best = totalArea;
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
  const answer = solve(points);
  console.log(answer.toString());
}

main();
