---
title: "Advent of Code 2025 – Day 04"
date: 2025-12-04
tags: [aoc, advent-of-code, 2025]
---

# Advent of Code 2025 - Day 4: Printing Department

Forklifts, paper rolls, and lots of adjacency checks: Day 4 turned into a neat graph-like puzzle. Here’s how I solved both parts and what their complexity looks like.

## Part 1 – Finding accessible rolls
Each roll of paper is represented by `@` on a grid. A roll is accessible if fewer than four of the eight neighboring cells also contain rolls. The solver:
1. Parses the grid from `input.txt`.
2. Walks every cell; when it finds an `@`, it counts the occupied neighbors using the eight-direction offsets.
3. Increments the answer whenever the neighbor count is `< 4`.

**Complexity:** Let the grid be `H x W`. We inspect each cell once and examine up to eight neighbors, so runtime is `O(H * W)` with `O(1)` auxiliary memory.

## Part 2 – Removing rolls in waves
Part 2 asks for the total number of rolls that can be removed if we repeatedly remove any roll that’s currently accessible (i.e., has fewer than four neighbors). This is essentially a flood of “peeling” operations.

Steps:
1. Precompute, for every roll cell, how many neighboring rolls it has and store a boolean `active` flag.
2. Push every roll with `< 4` neighbors into a queue.
3. Pop from the queue; if the roll is still active and below the neighbor threshold, remove it. After removal, decrement the neighbor counts of its live neighbors and enqueue any that just fell below the threshold.
4. Continue until the queue empties; the removal counter is the answer.

This is equivalent to a BFS/queue-based propagation. Every cell enters the queue a bounded number of times and every edge (adjacent pair) is visited when counts change.

**Complexity:** Each roll is marked and potentially enqueued a few times, but every adjacency update happens at most once per removal. This keeps the runtime at `O(H * W)` with `O(H * W)` storage for the neighbor counts, active flags, and queue bookkeeping.

## Takeaways
- Both parts rely on the same grid parsing and eight-direction neighbor logic, so `part2.js` largely reuses the constants and helpers from `part1.js`.
- Treating the removal process like a queue-driven cascade avoids repeated rescans of the grid.
- The constraints are friendly enough that a straightforward implementation in Node stays fast, even for large inputs.

With the forklifts now able to reach (and remove) everything they need, the path to the cafeteria is clear.


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], /*self*/ [0, 1],
    [1, -1], [1, 0], [1, 1],
];

function readGrid(filePath) {
    try {
        return fs
        .readFileSync(filePath, 'utf8')
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (error) {
        throw new Error(`Unable to read input file: ${filePath}`);
    }
}

function countAccessibleRolls(grid) {
    const height = grid.length;
    const width = grid[0]?.length ?? 0;

    let count = 0;
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
        if (grid[y][x] !== '@') {
            continue;
        }

        let adjacent = 0;
        for (const [dy, dx] of DIRECTIONS) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
            continue;
            }
            if (grid[ny][nx] === '@') {
            adjacent += 1;
            }
        }

        if (adjacent < 4) {
            count += 1;
        }
        }
    }

    return count;
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

    const result = countAccessibleRolls(grid);
    console.log(result.toString());
}

main();

```

</details>

<details>
<summary><strong>▶ Part 2 Code</strong></summary>

```js
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

```

</details>
