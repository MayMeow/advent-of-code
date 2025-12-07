const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function readGrid(filePath) {
  try {
    return fs
      .readFileSync(filePath, 'utf8')
      .trimEnd()
      .split(/\r?\n/)
      .map((line) => line.split(''));
  } catch (error) {
    throw new Error(`Unable to read input file: ${filePath}`);
  }
}

function findStart(grid) {
  for (let y = 0; y < grid.length; y += 1) {
    const x = grid[y].indexOf('S');
    if (x !== -1) {
      return { row: y, col: x };
    }
  }
  throw new Error('Start position S not found in grid.');
}

function countTimelines(grid) {
  const { row: startRow, col: startCol } = findStart(grid);
  const width = grid[0]?.length ?? 0;
  let active = Array(width).fill(0n);
  active[startCol] = 1n;

  for (let y = startRow + 1; y < grid.length; y += 1) {
    const next = Array(width).fill(0n);
    for (let x = 0; x < width; x += 1) {
      const ways = active[x];
      if (ways === 0n) {
        continue;
      }
      const cell = grid[y][x];
      if (cell === '^') {
        if (x - 1 >= 0) {
          next[x - 1] += ways;
        }
        if (x + 1 < width) {
          next[x + 1] += ways;
        }
      } else {
        next[x] += ways;
      }
    }
    active = next;
  }

  return active.reduce((sum, value) => sum + value, 0n);
}

function main() {
  const grid = readGrid(inputPath);
  if (!grid.length) {
    console.log('0');
    return;
  }

  const result = countTimelines(grid);
  console.log(result.toString());
}

main();
