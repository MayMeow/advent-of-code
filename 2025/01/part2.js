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
