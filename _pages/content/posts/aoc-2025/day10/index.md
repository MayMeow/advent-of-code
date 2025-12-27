---
title: "Advent of Code 2025 – Day 10"
date: 2025-12-10
tags: [aoc, advent-of-code, 2025]
categories: ['2025']
---

# Advent of Code 2025 - Day 10: Factory

Today’s puzzle felt like fixing two halves of the same machine: first we snap indicator lights into place with toggles, then we flip a lever and treat those same buttons like little add-one circuits. Two different algebra problems, one pile of schematics.

## Part 1 – Minimal toggles for the lights
1. Parse each line into the target light pattern plus the list of buttons, turning both into `BigInt` bitmasks so large switch panels stay precise.
2. Run a BFS per machine starting from the all-off mask, XOR-ing in each button mask to explore reachable states; the first time we hit the goal mask we know we spent the minimum presses.
3. Sum those per-machine minima to get the final answer of `461`.

**Complexity:** With `L` lights and `B` buttons, each BFS visits at most `2^L` states with `O(B)` transitions per state, which is fine because `L` is small (≤10 in the input). Memory matches the state space size.

## Part 2 – Dialing joltage with linear algebra
1. Ignore the indicator diagram and treat the buttons as columns of a matrix where `A[row][col] = 1` if that button bumps the `row` counter.
2. Perform Gauss–Jordan elimination over exact fractions to reach RREF and detect the pivot columns; this gives the affine solution space `Ax = target`.
3. Apply natural bounds (a button can’t be pressed more times than any counter it touches requires) and enumerate combinations for the free variables, plugging them back into the pivot equations to keep everything non-negative and integral.
4. Track the minimal total press count across all valid assignments; the best total across every machine sums to `16386`.

**Complexity:** RREF costs roughly `O(C * B^2)` per machine (`C` counters, `B` buttons). Enumerating the few free variables is exponential in their count, but in practice each machine exposes at most three, keeping the search tiny.

## Takeaways
- Bitmask BFS is perfect for “toggle to reach a pattern” puzzles where states are tiny but branching factors are awkward to reason about.
- The same wiring data becomes a linear system once presses accumulate instead of flip, so recognizing the algebra shift avoids brute-force explosions.
- Bounding free variables by each button’s tightest counter need keeps the Part 2 search space civilized.
- Exact arithmetic (fractions + `BigInt`) prevents rounding bugs when you’re juggling pivots and large counter values.

One factory hall lit up, two problem domains solved. On to the next floor of the advent calendar.


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const raw = fs.readFileSync(inputPath, 'utf8').trim();
const lines = raw.split(/\r?\n/).filter(Boolean);

function parseMachine(line) {
  const indicatorMatch = line.match(/\[([.#]+)\]/);
  if (!indicatorMatch) {
    throw new Error(`Missing indicator lights in line: ${line}`);
  }
  const indicator = indicatorMatch[1];
  const specPart = line.split('{')[0];
  const buttonMatches = [...specPart.matchAll(/\(([0-9,\s]+)\)/g)];
  if (buttonMatches.length === 0) {
    throw new Error(`No buttons found in line: ${line}`);
  }
  const target = indicatorToMask(indicator);
  const buttons = buttonMatches.map((match) => buttonToMask(match[1]));
  return { target, buttons };
}

function indicatorToMask(str) {
  let mask = 0n;
  for (let i = 0; i < str.length; i += 1) {
    if (str[i] === '#') {
      mask |= 1n << BigInt(i);
    }
  }
  return mask;
}

function buttonToMask(spec) {
  const indices = spec
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const value = Number(part);
      if (!Number.isInteger(value)) {
        throw new Error(`Invalid button index: ${spec}`);
      }
      return value;
    });
  let mask = 0n;
  for (const idx of indices) {
    mask |= 1n << BigInt(idx);
  }
  return mask;
}

function minButtonPresses(target, buttons) {
  if (target === 0n) {
    return 0;
  }
  const queue = [0n];
  const visited = new Map();
  visited.set(0n, 0);
  for (let i = 0; i < queue.length; i += 1) {
    const state = queue[i];
    const steps = visited.get(state);
    for (const button of buttons) {
      const next = state ^ button;
      if (visited.has(next)) {
        continue;
      }
      const nextSteps = steps + 1;
      if (next === target) {
        return nextSteps;
      }
      visited.set(next, nextSteps);
      queue.push(next);
    }
  }
  throw new Error('Target configuration is unreachable with given buttons.');
}

let total = 0;
for (const line of lines) {
  const { target, buttons } = parseMachine(line);
  total += minButtonPresses(target, buttons);
}

console.log(String(total));

```

</details>

<details>
<summary><strong>▶ Part 2 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const raw = fs.readFileSync(inputPath, 'utf8').trim();
const lines = raw.length ? raw.split(/\r?\n/).filter(Boolean) : [];

function parseMachine(line) {
  const indicatorMatch = line.match(/\[([.#]+)\]/);
  if (!indicatorMatch) {
    throw new Error(`Missing indicator diagram in line: ${line}`);
  }
  const buttonMatches = [...line.matchAll(/\(([0-9,\s]+)\)/g)];
  if (buttonMatches.length === 0) {
    throw new Error(`No buttons found for machine: ${line}`);
  }
  const targetMatch = line.match(/\{([^}]+)\}/);
  if (!targetMatch) {
    throw new Error(`Missing joltage requirements in line: ${line}`);
  }
  const targets = targetMatch[1]
    .split(',')
    .map((value) => Number(value.trim()));
  if (targets.some((value) => !Number.isInteger(value))) {
    throw new Error(`Invalid target values in line: ${line}`);
  }
  const buttons = buttonMatches.map((match) => {
    const indices = match[1]
      .split(',')
      .map((segment) => {
        const idx = Number(segment.trim());
        if (!Number.isInteger(idx)) {
          throw new Error(`Invalid button index "${segment}" in line: ${line}`);
        }
        return idx;
      })
      .filter((idx) => Number.isInteger(idx));
    return indices;
  });
  return { buttons, targets };
}

class Fraction {
  constructor(num, den = 1n) {
    if (den === 0n) {
      throw new Error('Zero denominator in fraction');
    }
    if (num === 0n) {
      this.num = 0n;
      this.den = 1n;
      return;
    }
    if (den < 0n) {
      num = -num;
      den = -den;
    }
    const g = gcd(absBigInt(num), den);
    this.num = num / g;
    this.den = den / g;
  }

  static zero() {
    return new Fraction(0n);
  }

  static one() {
    return new Fraction(1n);
  }

  static fromInt(value) {
    return new Fraction(BigInt(value));
  }

  isZero() {
    return this.num === 0n;
  }

  isInteger() {
    return this.den === 1n;
  }

  add(other) {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other) {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other) {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  mulInt(value) {
    return new Fraction(this.num * BigInt(value), this.den);
  }

  div(other) {
    if (other.num === 0n) {
      throw new Error('Division by zero fraction');
    }
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  asBigInt() {
    if (!this.isInteger()) {
      throw new Error('Fraction is not an integer');
    }
    return this.num;
  }
}

function absBigInt(value) {
  return value < 0n ? -value : value;
}

function gcd(a, b) {
  a = absBigInt(a);
  b = absBigInt(b);
  while (b !== 0n) {
    const temp = a % b;
    a = b;
    b = temp;
  }
  return a;
}

function buildMatrix(buttons, counterCount) {
  const rows = counterCount;
  const cols = buttons.length;
  const matrix = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Fraction.zero())
  );
  buttons.forEach((indices, col) => {
    for (const counterIdx of indices) {
      if (counterIdx < 0 || counterIdx >= counterCount) {
        throw new Error('Button references out-of-range counter index');
      }
      matrix[counterIdx][col] = Fraction.one();
    }
  });
  return matrix;
}

function rref(matrix, rhs) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const pivotCols = Array(rows).fill(-1);
  let currentRow = 0;

  for (let col = 0; col < cols && currentRow < rows; col += 1) {
    let pivotRow = -1;
    for (let row = currentRow; row < rows; row += 1) {
      if (!matrix[row][col].isZero()) {
        pivotRow = row;
        break;
      }
    }
    if (pivotRow === -1) {
      continue;
    }
    if (pivotRow !== currentRow) {
      [matrix[pivotRow], matrix[currentRow]] = [matrix[currentRow], matrix[pivotRow]];
      [rhs[pivotRow], rhs[currentRow]] = [rhs[currentRow], rhs[pivotRow]];
    }
    const pivotVal = matrix[currentRow][col];
    for (let c = col; c < cols; c += 1) {
      matrix[currentRow][c] = matrix[currentRow][c].div(pivotVal);
    }
    rhs[currentRow] = rhs[currentRow].div(pivotVal);

    for (let row = 0; row < rows; row += 1) {
      if (row === currentRow) {
        continue;
      }
      const factor = matrix[row][col];
      if (factor.isZero()) {
        continue;
      }
      for (let c = col; c < cols; c += 1) {
        matrix[row][c] = matrix[row][c].sub(factor.mul(matrix[currentRow][c]));
      }
      rhs[row] = rhs[row].sub(factor.mul(rhs[currentRow]));
    }

    pivotCols[currentRow] = col;
    currentRow += 1;
  }

  for (let row = currentRow; row < rows; row += 1) {
    const allZero = matrix[row].every((value) => value.isZero());
    if (allZero && !rhs[row].isZero()) {
      throw new Error('System has no solution.');
    }
  }

  return { matrix, rhs, pivotCols, rank: currentRow };
}

function solveMachine(machine) {
  const { buttons, targets } = machine;
  const counterCount = targets.length;
  const matrix = buildMatrix(buttons, counterCount);
  const rhs = targets.map((value) => Fraction.fromInt(value));
  const { matrix: rMatrix, rhs: rRhs, pivotCols, rank } = rref(matrix, rhs);
  const columnCount = buttons.length;

  const pivotRowForCol = Array(columnCount).fill(-1);
  for (let row = 0; row < rank; row += 1) {
    const pivotCol = pivotCols[row];
    if (pivotCol !== -1) {
      pivotRowForCol[pivotCol] = row;
    }
  }

  const freeCols = [];
  for (let col = 0; col < columnCount; col += 1) {
    if (pivotRowForCol[col] === -1) {
      freeCols.push(col);
    }
  }

  const buttonBounds = buttons.map((indices) => {
    if (indices.length === 0) {
      return 0;
    }
    let bound = Number.POSITIVE_INFINITY;
    for (const counterIdx of indices) {
      bound = Math.min(bound, targets[counterIdx]);
    }
    return bound;
  });

  if (freeCols.length === 0) {
    const counts = Array(columnCount).fill(0);
    for (let col = 0; col < columnCount; col += 1) {
      const row = pivotRowForCol[col];
      if (row === -1) {
        continue;
      }
      const value = rRhs[row];
      if (!value.isInteger()) {
        throw new Error('Unique solution is not integral.');
      }
      const intValue = Number(value.asBigInt());
      if (intValue < 0 || intValue > buttonBounds[col]) {
        throw new Error('Unique solution violates bounds.');
      }
      counts[col] = intValue;
    }
    return counts.reduce((sum, value) => sum + value, 0);
  }

  let best = Number.POSITIVE_INFINITY;
  const assignments = Array(freeCols.length).fill(0);

  function enumerate(index, pivotValues, freeSum) {
    if (freeSum >= best) {
      return;
    }
    if (index === freeCols.length) {
      const counts = Array(columnCount).fill(0);
      for (let i = 0; i < freeCols.length; i += 1) {
        const col = freeCols[i];
        const value = assignments[i];
        if (value > buttonBounds[col]) {
          return;
        }
        counts[col] = value;
      }
      for (let col = 0; col < columnCount; col += 1) {
        const row = pivotRowForCol[col];
        if (row === -1) {
          continue;
        }
        const fracValue = pivotValues[row];
        if (!fracValue.isInteger()) {
          return;
        }
        const intValue = Number(fracValue.asBigInt());
        if (intValue < 0 || intValue > buttonBounds[col]) {
          return;
        }
        counts[col] = intValue;
      }
      const total = counts.reduce((sum, value) => sum + value, 0);
      if (total < best) {
        best = total;
      }
      return;
    }

    const column = freeCols[index];
    const maxCount = buttonBounds[column];
    for (let value = 0; value <= maxCount; value += 1) {
      assignments[index] = value;
      const nextPivotValues = pivotValues.map((current, rowIdx) => {
        const coefficient = rMatrix[rowIdx][column];
        if (coefficient.isZero() || value === 0) {
          return current;
        }
        return current.sub(coefficient.mulInt(value));
      });
      enumerate(index + 1, nextPivotValues, freeSum + value);
    }
  }

  const initialPivotValues = rRhs.slice(0, rank);
  enumerate(0, initialPivotValues, 0);

  if (!Number.isFinite(best)) {
    throw new Error('No valid integer solution found.');
  }

  return best;
}

let total = 0;
for (const line of lines) {
  const machine = parseMachine(line);
  total += solveMachine(machine);
}

console.log(String(total));

```

</details>
