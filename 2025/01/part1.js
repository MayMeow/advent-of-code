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
