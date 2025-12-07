const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], /* self */ [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function readGrid(filePath) {
  try {
    return fs
      .readFileSync(filePath, 'utf8')
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.split(''));
  } catch (error) {
    throw new Error(`Unable to read input file: ${filePath}`);
  }
}

function initializeNeighborCounts(grid) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const counts = Array.from({ length: height }, () => Array(width).fill(0));
  const active = Array.from({ length: height }, () => Array(width).fill(false));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (grid[y][x] !== '@') {
        continue;
      }
      active[y][x] = true;
      let adj = 0;
      for (const [dy, dx] of DIRECTIONS) {
        const ny = y + dy;
        const nx = x + dx;
        if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
          continue;
        }
        if (grid[ny][nx] === '@') {
          adj += 1;
        }
      }
      counts[y][x] = adj;
    }
  }

  return { counts, active };
}

function countRemovableRolls(grid) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  if (height === 0 || width === 0) {
    return 0;
  }

  const { counts, active } = initializeNeighborCounts(grid);
  const queued = Array.from({ length: height }, () => Array(width).fill(false));
  const queue = [];
  let head = 0;

  function enqueue(y, x) {
    if (queued[y][x]) {
      return;
    }
    queue.push([y, x]);
    queued[y][x] = true;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (active[y][x] && counts[y][x] < 4) {
        enqueue(y, x);
      }
    }
  }

  let removed = 0;

  while (head < queue.length) {
    const [y, x] = queue[head];
    head += 1;
    queued[y][x] = false;

    if (!active[y][x]) {
      continue;
    }
    if (counts[y][x] >= 4) {
      continue;
    }

    active[y][x] = false;
    removed += 1;

    for (const [dy, dx] of DIRECTIONS) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
        continue;
      }
      if (!active[ny][nx]) {
        continue;
      }
      counts[ny][nx] -= 1;
      if (counts[ny][nx] < 4) {
        enqueue(ny, nx);
      }
    }
  }

  return removed;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const grid = readGrid(inputPath);
  if (grid.length === 0) {
    console.log('0');
    return;
  }

  const result = countRemovableRolls(grid);
  console.log(result.toString());
}

main();
