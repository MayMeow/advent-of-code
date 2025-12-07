const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function parseRanges(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const [rangesSection] = raw.split(/\r?\n\r?\n/);
    if (!rangesSection) {
        return [];
    }

    return rangesSection
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
        const [startStr, endStr] = line.split('-');
        if (!startStr || !endStr) {
            throw new Error(`Invalid range line: ${line}`);
        }
        const start = BigInt(startStr);
        const end = BigInt(endStr);
        if (start > end) {
            throw new Error(`Range start greater than end: ${line}`);
        }
        return { start, end };
        });
}

function mergeRanges(ranges) {
    if (ranges.length === 0) {
        return [];
    }
    const sorted = ranges
        .map((range) => (range.start <= range.end ? range : { start: range.end, end: range.start }))
        .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i += 1) {
        const current = sorted[i];
        const last = merged[merged.length - 1];
        if (current.start <= last.end + 1n) {
        last.end = last.end > current.end ? last.end : current.end;
        } else {
        merged.push({ ...current });
        }
    }
    return merged;
}

function countFreshIds(ranges) {
    const merged = mergeRanges(ranges);
    return merged.reduce((sum, range) => sum + (range.end - range.start + 1n), 0n);
}

function main() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exitCode = 1;
        return;
    }

    const ranges = parseRanges(inputPath);
    if (ranges.length === 0) {
        console.log('0');
        return;
    }

    const result = countFreshIds(ranges);
    console.log(result.toString());
}

main();
