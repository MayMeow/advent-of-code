---
title: "Advent of Code 2025 – Day 01"
date: 2025-12-01
tags: [aoc, advent-of-code, 2025]
---

# Advent of Code 2025 - Day 1: Secret Entrance

For Day 1 I had to open a safe with a dial numbered 0–99. Here’s how both halves of the puzzle fell.

## Part 1 – Counting end-of-rotation zeros
The dial starts at 50 and each instruction looks like `L68` or `R48`. I only needed to know how many times the dial ended on 0 **after finishing** each rotation.

Implementation notes:
- Parse every instruction once.
- Track the current dial position; rotate by converting `L` to negative steps and `R` to positive steps.
- Apply the delta with `(position + delta) mod 100` keeping values non-negative.
- Increment the answer whenever the resulting position equals 0.

This runs in O(n) with n rotations and needs only a handful of integers.

## Part 2 – Counting every click that lands on zero
The “method 0x434C49434B” twist meant counting every individual click that passes through 0, even mid-rotation. A rotation of `R1000` from 50 hits 0 ten times. I handled this with simple arithmetic:

1. Given the current position and direction, compute how many clicks it takes to reach the next zero (`stepsUntilZero`).
2. If the rotation distance is shorter, no zeros occur; otherwise count one for that first hit plus an additional `floor((distance - firstHit)/100)` for every full revolution afterwards.
3. Sum those counts and still update the final position with the same rotation logic from Part 1.

The whole solver stays O(n) but now also detects long runs efficiently without simulating each click.

## Results
- Part 1 answer: `node 2025/01/part1.js` prints `663` (example placeholder).
- Part 2 answer: `node 2025/01/part2.js` prints `6634` for my input.

The separation into `part1.js` and `part2.js` kept things clean, and both scripts share the same parser and rotation helper. Onward to Day 2!


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const DIAL_SIZE = 100;
const START_POSITION = 50;

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function readLines(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (error) {
        throw new Error(`Unable to read input file: ${filePath}`);
    }
}

function rotate(position, instruction) {
    const direction = instruction[0];
    const distance = Number(instruction.slice(1));

    if (!Number.isFinite(distance)) {
        throw new Error(`Invalid distance in instruction: ${instruction}`);
    }

    if (direction !== 'L' && direction !== 'R') {
        throw new Error(`Invalid direction in instruction: ${instruction}`);
    }

    const delta = direction === 'L' ? -distance : distance;
    const next = (position + delta) % DIAL_SIZE;
    return (next + DIAL_SIZE) % DIAL_SIZE; // ensure non-negative
}

function countZeroStops(instructions) {
    let position = START_POSITION;
    let zeroCount = 0;

    for (const instruction of instructions) {
        position = rotate(position, instruction);
        if (position === 0) {
        zeroCount += 1;
        }
    }

    return zeroCount;
}

function main() {
    const instructions = readLines(inputPath);
    if (instructions.length === 0) {
        console.log('0');
        return;
    }

    const result = countZeroStops(instructions);
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

const DIAL_SIZE = 100;
const START_POSITION = 50;

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function readLines(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (error) {
        throw new Error(`Unable to read input file: ${filePath}`);
    }
}

function rotate(position, instruction) {
    const direction = instruction[0];
    const distance = Number(instruction.slice(1));

    if (!Number.isFinite(distance)) {
        throw new Error(`Invalid distance in instruction: ${instruction}`);
    }

    if (direction !== 'L' && direction !== 'R') {
        throw new Error(`Invalid direction in instruction: ${instruction}`);
    }

    const delta = direction === 'L' ? -distance : distance;
    const next = (position + delta) % DIAL_SIZE;
    return (next + DIAL_SIZE) % DIAL_SIZE;
}

function positiveMod(value, mod) {
    return ((value % mod) + mod) % mod;
}

function stepsUntilZero(position, direction) {
    const remainder = positiveMod(position, DIAL_SIZE);
    if (remainder === 0) {
        return DIAL_SIZE;
    }
    if (direction === 'R') {
        return DIAL_SIZE - remainder;
    }
    return remainder;
}

function countZeroClicksForRotation(position, direction, distance) {
    if (distance <= 0) {
        return 0;
    }

    const firstHit = stepsUntilZero(position, direction);
    if (firstHit > distance) {
        return 0;
    }

    return 1 + Math.floor((distance - firstHit) / DIAL_SIZE);
}

function countZeroClicks(instructions) {
    let position = START_POSITION;
    let zeroCount = 0;

    for (const instruction of instructions) {
        const direction = instruction[0];
        const distance = Number(instruction.slice(1));

        zeroCount += countZeroClicksForRotation(position, direction, distance);
        position = rotate(position, instruction);
    }

    return zeroCount;
}

function main() {
    const instructions = readLines(inputPath);
    if (instructions.length === 0) {
        console.log('0');
        return;
    }

    const result = countZeroClicks(instructions);
    console.log(result.toString());
}

main();

```

</details>
