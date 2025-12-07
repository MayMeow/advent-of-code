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
