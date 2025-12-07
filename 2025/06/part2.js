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
