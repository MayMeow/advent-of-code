---
title: "Advent of Code 2025 – Day 02"
date: 2025-12-02
tags: [aoc, advent-of-code, 2025]
---

# Advent of Code 2025 - Day 2: Gift Shop

Day 2 was all about spotting playful ID patterns inside huge numerical ranges. Here’s how both parts came together.

## Input parsing shared by both parts
The puzzle input is one comma-separated line of inclusive ranges (`start-end`). I parse everything as `BigInt` so that the gigantic IDs stay precise. After that, each part does its own math on top of the same parsed data.

## Part 1 – Double-half IDs
**Condition.** An ID is invalid if it is exactly two copies of some digit string (e.g., `64 64`). If the repeated block has length `h`, then the ID equals `pattern * 10^h + pattern`.

**Approach.** For every range I loop over all feasible `h` (up to half the digit count of the range’s end). For each `h`:
1. The pattern must be between `10^{h-1}` and `10^h - 1`.
2. The ID multiplier is `10^h + 1`. Valid patterns are those where `start <= multiplier * pattern <= end`.
3. Because the multiplier is constant, I can intersect `[start/multiplier, end/multiplier]` with the valid pattern bounds and use arithmetic-series sums to add up the corresponding IDs.

The final sum is just the accumulation of all these chunks across every range.

**Complexity.** Let `R` be the number of ranges and `D` the maximum digit count of any upper bound. The number of candidate half-lengths is `O(D)`, and each is processed with O(1) arithmetic. So the runtime is roughly `O(R * D)` and memory is `O(1)` besides the parsed data.

## Part 2 – Any repeated block (length ≥ 1)
**Condition.** IDs are invalid if they are made of some pattern repeated two or more times (e.g., `123123123`). These are numbers of the form `pattern * (10^{k*h-1} + ... + 1)` where `k` is the repeat count.

**Approach.** Instead of checking every ID, I enumerated pattern lengths (`h`) and repeat counts (`k`). The multiplier for a given `(h, k)` is `Σ_{i=0}^{k-1} 10^{i*h}`. For every range I intersect the pattern bounds with `[start/multiplier, end/multiplier]` to find all candidate patterns.

However, many IDs are representable with smaller periods, so I apply inclusion–exclusion: for each `(h, k)` I subtract contributions already accounted for by its proper divisors. Tracking partial sums in a map ensures every ID is counted exactly once.

**Complexity.** Enumerating base lengths and repeat counts still scales with `O(R * D^2)` in the worst case because there can be `O(D)` repeat counts per base length. The inclusion–exclusion bookkeeping adds a constant factor. Memory usage is `O(D^2)` for the memoized contributions.

## Takeaways
- Staying in the arithmetic domain (no brute-force per ID) is the only way to handle the enormous ranges.
- BigInt arithmetic makes these formulas safe and keeps the implementation close to the math definitions.
- Inclusion–exclusion is the trick that unlocks Part 2; otherwise numbers with smaller periods would be double-counted.

With both scripts (`part1.js` and `part2.js`) ready, it’s easy to run either variant and catch every mischievous pattern the young Elf left behind. On to the next floor!


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function readRanges(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) {
        return [];
    }

    return raw
        .split(',')
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0)
        .map((range) => {
        const [startStr, endStr] = range.split('-');
        if (!startStr || !endStr) {
            throw new Error(`Invalid range: ${range}`);
        }
        const start = BigInt(startStr);
        const end = BigInt(endStr);
        if (start > end) {
            throw new Error(`Range start greater than end: ${range}`);
        }
        return { start, end };
        });
}

function pow10(exp) {
    let result = 1n;
    for (let i = 0; i < exp; i += 1) {
        result *= 10n;
    }
    return result;
}

function ceilDiv(a, b) {
    return (a + b - 1n) / b;
}

function sumRepeatedHalfNumbers(start, end) {
    let total = 0n;
    const maxDigits = end.toString().length;
    const maxHalf = Math.floor(maxDigits / 2);

    for (let halfLen = 1; halfLen <= maxHalf; halfLen += 1) {
        const minHalf = pow10(halfLen - 1);
        const maxHalfValue = pow10(halfLen) - 1n;
        const multiplier = pow10(halfLen) + 1n;

        let first = ceilDiv(start, multiplier);
        if (first < minHalf) {
        first = minHalf;
        }

        let last = end / multiplier;
        if (last > maxHalfValue) {
        last = maxHalfValue;
        }

        if (first > last) {
        continue;
        }

        const count = last - first + 1n;
        const sumHalves = (first + last) * count / 2n;
        total += sumHalves * multiplier;
    }

    return total;
}

function solve(ranges) {
    return ranges.reduce((acc, range) => acc + sumRepeatedHalfNumbers(range.start, range.end), 0n);
}

function main() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exitCode = 1;
        return;
    }

    const ranges = readRanges(inputPath);
    if (ranges.length === 0) {
        console.log('0');
        return;
    }

    const result = solve(ranges);
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

function readRanges(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) {
        return [];
    }

    return raw
        .split(',')
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0)
        .map((range) => {
        const [startStr, endStr] = range.split('-');
        if (!startStr || !endStr) {
            throw new Error(`Invalid range: ${range}`);
        }
        const start = BigInt(startStr);
        const end = BigInt(endStr);
        if (start > end) {
            throw new Error(`Range start greater than end: ${range}`);
        }
        return { start, end };
        });
}

const pow10Cache = new Map([[0, 1n]]);

function pow10(exp) {
    if (pow10Cache.has(exp)) {
        return pow10Cache.get(exp);
    }
    const value = pow10(exp - 1) * 10n;
    pow10Cache.set(exp, value);
    return value;
}

function ceilDiv(a, b) {
    if (a >= 0n) {
        return (a + b - 1n) / b;
    }
    return a / b;
}

function sumArithmetic(first, last) {
    const count = last - first + 1n;
    return (first + last) * count / 2n;
}

function getProperDivisors(n) {
    const divisors = [];
    for (let d = 1; d * d <= n; d += 1) {
        if (n % d !== 0) {
        continue;
        }
        if (d !== n) {
        divisors.push(d);
        }
        const other = n / d;
        if (other !== d && other !== n) {
        divisors.push(other);
        }
    }
    return divisors;
}

function sumInvalidInRange(start, end) {
    if (start > end) {
        return 0n;
    }

    const primitiveMap = new Map();
    const maxDigits = end.toString().length;
    const maxBaseLen = Math.floor(maxDigits / 2);
    let total = 0n;

    for (let baseLen = 1; baseLen <= maxBaseLen; baseLen += 1) {
        const maxRep = Math.floor(maxDigits / baseLen);
        if (maxRep < 2) {
        continue;
        }

        const minPattern = pow10(baseLen - 1);
        const maxPattern = pow10(baseLen) - 1n;
        const powStep = pow10(baseLen);

        const multipliers = new Array(maxRep + 1).fill(0n);
        let multiplier = 1n;
        let power = 1n;
        multipliers[1] = 1n;
        for (let rep = 2; rep <= maxRep; rep += 1) {
        power *= powStep;
        multiplier += power;
        multipliers[rep] = multiplier;
        }

        const divisors = getProperDivisors(baseLen);

        for (let repCount = 2; repCount <= maxRep; repCount += 1) {
        const multi = multipliers[repCount];
        if (!multi) {
            primitiveMap.set(`${baseLen}|${repCount}`, 0n);
            continue;
        }

        let first = ceilDiv(start, multi);
        if (first < minPattern) {
            first = minPattern;
        }

        let last = end / multi;
        if (last > maxPattern) {
            last = maxPattern;
        }

        if (first > last) {
            primitiveMap.set(`${baseLen}|${repCount}`, 0n);
            continue;
        }

        let sumAll = sumArithmetic(first, last) * multi;

        for (const divisor of divisors) {
            const factor = baseLen / divisor;
            if (factor * divisor !== baseLen) {
            continue;
            }
            const relatedRep = repCount * factor;
            const subtract = primitiveMap.get(`${divisor}|${relatedRep}`) ?? 0n;
            sumAll -= subtract;
        }

        primitiveMap.set(`${baseLen}|${repCount}`, sumAll);
        total += sumAll;
        }
    }

    return total;
}

function solve(ranges) {
    return ranges.reduce((acc, range) => acc + sumInvalidInRange(range.start, range.end), 0n);
}

function main() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exitCode = 1;
        return;
    }

    const ranges = readRanges(inputPath);
    if (ranges.length === 0) {
        console.log('0');
        return;
    }

    const result = solve(ranges);
    console.log(result.toString());
}

main();

```

</details>
