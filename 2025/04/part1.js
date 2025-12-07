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
