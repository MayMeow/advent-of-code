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

function countSplits(grid) {
  const { row: startRow, col: startCol } = findStart(grid);
  const width = grid[0]?.length ?? 0;
  let active = new Set([startCol]);
  let splits = 0;

  for (let y = startRow + 1; y < grid.length; y += 1) {
    if (active.size === 0) {
      break;
    }

    const next = new Set();
    for (const col of active) {
      if (col < 0 || col >= width) {
        continue;
      }

      const cell = grid[y][col];
      if (cell === '^') {
        splits += 1;
        if (col - 1 >= 0) {
          next.add(col - 1);
        }
        if (col + 1 < width) {
          next.add(col + 1);
        }
      } else {
        next.add(col);
      }
    }

    active = next;
  }

  return splits;
}

function main() {
  const grid = readGrid(inputPath);
  if (!grid.length) {
    console.log('0');
    return;
  }

  const result = countSplits(grid);
  console.log(result.toString());
}

main();
