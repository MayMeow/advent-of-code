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
