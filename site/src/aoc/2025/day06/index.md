---
title: "Advent of Code 2025 – Day 06"
date: 2025-12-06
tags: [aoc, advent-of-code, 2025]
---

# Day 6: Trash Compactor

## Summary
Day 6 brings us into a garbage compactor where we meet a family of cephalopods. To pass the time while they open the door, we help the youngest one with her math homework. The puzzle involves parsing a 2D grid of characters representing math problems. The twist is in how the numbers and operations are arranged spatially.

## Part 1
In Part 1, the problems are arranged horizontally but stacked vertically. Problems are separated by empty columns. Within a problem block, each line contains a number, and the bottom line contains the operator (`+` or `*`).

### Solution Approach
1.  **Grid Parsing**: Read the input file into a 2D grid (array of strings).
2.  **Problem Extraction**: Scan the grid column by column to identify "blank columns" (columns containing only spaces). These blank columns serve as delimiters between problems. We collect the start and end x-coordinates for each problem block.
3.  **Parsing Individual Problems**: For each block:
    *   Iterate through the rows.
    *   Parse the number on each row.
    *   Identify the operator at the bottom (either `+` or `*`).
4.  **Evaluation**: Apply the operator to the list of numbers (sum or product).
5.  **Aggregation**: Sum the results of all problems to get the grand total.

### Code Snippet (Problem Extraction)
```javascript
function extractProblems(grid) {
  const height = grid.length;
  const width = Math.max(...grid.map((line) => line.length));
  // ... helper to check if column is blank ...

  const problems = [];
  let x = 0;
  while (x < width) {
    // Skip blank columns
    while (x < width && isBlankColumn(x)) x += 1;
    if (x >= width) break;
    
    const start = x;
    // Find end of problem block
    while (x < width && !isBlankColumn(x)) x += 1;
    problems.push([start, x]);
  }
  return problems;
}
```

## Part 2
Part 2 reveals that we were reading the "cephalopod math" incorrectly. The structure is actually column-based and read right-to-left.
*   Each number is a vertical column (digits read top-to-bottom).
*   Problems are still separated by blank columns.
*   The operator is still at the bottom.

### Solution Approach
The logic is similar to Part 1 but rotated.
1.  **Right-to-Left Scanning**: We scan the grid from `width - 1` down to `0` to find problem boundaries.
2.  **Column-wise Number Parsing**: Within a problem block, we iterate through columns (right-to-left).
    *   For each column, read digits from top to bottom (excluding the last row which might contain the operator).
    *   Join the digits to form a number.
3.  **Operator Identification**: Check the bottom row of the current column for the operator.
4.  **Evaluation**: Same as Part 1 (sum or product of the collected numbers).

### Complexity Analysis
*   **Time Complexity**: $O(W \times H)$, where $W$ is the width and $H$ is the height of the grid. In both parts, we visit every cell in the grid a constant number of times (once to check for blank columns, and once to parse the content).
*   **Space Complexity**: $O(W \times H)$ to store the grid in memory. The storage for the parsed numbers is negligible compared to the grid itself.

## Key Takeaways
*   **Grid Manipulation**: This problem reinforces skills in navigating 2D grids, specifically handling arbitrary boundaries (blank columns) rather than fixed-size cells.
*   **Parsing Strategy**: Separating the "identification of boundaries" from the "parsing of content" made the code cleaner and easier to adapt for Part 2.
*   **Directionality**: Part 2 required a shift in perspective (vertical numbers, right-to-left reading), which was easily handled by adjusting the loop directions.


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function readGrid(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw
        .replace(/\s+$/u, '')
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+$/u, ''));
}

function extractProblems(grid) {
    const height = grid.length;
    const width = Math.max(...grid.map((line) => line.length));

    const isBlankColumn = (x) => {
        for (let y = 0; y < height; y += 1) {
        const char = grid[y][x] ?? ' ';
        if (char !== ' ') {
            return false;
        }
        }
        return true;
    };

    const problems = [];
    let x = 0;
    while (x < width) {
        while (x < width && isBlankColumn(x)) {
        x += 1;
        }
        if (x >= width) {
        break;
        }
        const start = x;
        while (x < width && !isBlankColumn(x)) {
        x += 1;
        }
        problems.push([start, x]);
    }

    return problems;
}

function parseProblem(grid, bounds) {
    const [startX, endX] = bounds;
    const numbers = [];
    let current = '';

    for (let y = 0; y < grid.length; y += 1) {
        let lineChunk = '';
        for (let x = startX; x < endX; x += 1) {
        lineChunk += grid[y][x] ?? ' ';
        }
        const trimmed = lineChunk.trim();
        if (!trimmed) {
        continue;
        }
        if (trimmed === '+' || trimmed === '*') {
        return { numbers, op: trimmed };
        }
        current = trimmed;
        numbers.push(Number(current));
    }

    throw new Error('Operation symbol not found for problem.');
}

function evaluateProblem(problem) {
    const { numbers, op } = problem;
    if (numbers.length === 0) {
        return 0;
    }

    if (op === '+') {
        return numbers.reduce((sum, value) => sum + value, 0);
    }
    if (op === '*') {
        return numbers.reduce((product, value) => product * value, 1);
    }

    throw new Error(`Unknown operation: ${op}`);
}

function solve(grid) {
    const problems = extractProblems(grid);
    return problems.reduce((total, bounds) => {
        const problem = parseProblem(grid, bounds);
        return total + evaluateProblem(problem);
    }, 0);
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

    const result = solve(grid);
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

function readGrid(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw
        .replace(/\s+$/u, '')
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+$/u, ''));
}

function columnIsBlank(grid, x) {
    for (const row of grid) {
        const char = row[x] ?? ' ';
        if (char !== ' ') {
        return false;
        }
    }
    return true;
}

function extractProblems(grid) {
    const height = grid.length;
    const width = Math.max(...grid.map((line) => line.length));

    const problems = [];
    let x = width - 1;
    while (x >= 0) {
        while (x >= 0 && columnIsBlank(grid, x)) {
        x -= 1;
        }
        if (x < 0) {
        break;
        }
        const end = x + 1;
        while (x >= 0 && !columnIsBlank(grid, x)) {
        x -= 1;
        }
        problems.push([x + 1, end]);
    }

    return problems;
}

function parseProblem(grid, bounds) {
    const [startX, endX] = bounds;
    const height = grid.length;
    const numbers = [];
    let operator = null;

    for (let x = endX - 1; x >= startX; x -= 1) {
        const digits = [];
        for (let y = 0; y < height - 1; y += 1) {
        const char = grid[y][x] ?? ' ';
        if (char === ' ') {
            continue;
        }
        digits.push(char);
        }

        if (digits.length > 0) {
        numbers.push(Number(digits.join('')));
        }

        const bottomChar = grid[height - 1][x] ?? ' ';
        if (bottomChar === '+' || bottomChar === '*') {
        operator = bottomChar;
        }
    }

    if (operator === null) {
        throw new Error('Operation symbol not found');
    }

    return { numbers, op: operator };
}

function evaluateProblem({ numbers, op }) {
    if (op === '+') {
        return numbers.reduce((sum, value) => sum + value, 0);
    }
    if (op === '*') {
        return numbers.reduce((product, value) => product * value, 1);
    }
    throw new Error(`Unknown operator: ${op}`);
}

function solve(grid) {
    const problems = extractProblems(grid);
    return problems.reduce((total, bounds) => total + evaluateProblem(parseProblem(grid, bounds)), 0);
}

function main() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exitCode = 1;
        return;
    }

    const grid = readGrid(inputPath);
    if (!grid.length) {
        console.log('0');
        return;
    }

    const result = solve(grid);
    console.log(result.toString());
}

main();

```

</details>
