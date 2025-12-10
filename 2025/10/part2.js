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
