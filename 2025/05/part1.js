const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function parseInput(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const [rangesSection, idsSection] = raw.split(/\r?\n\r?\n/);

  const ranges = rangesSection
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [startStr, endStr] = line.split('-');
      if (!startStr || !endStr) {
        throw new Error(`Invalid range line: ${line}`);
      }
      const start = Number(startStr);
      const end = Number(endStr);
      if (Number.isNaN(start) || Number.isNaN(end)) {
        throw new Error(`Invalid number in range: ${line}`);
      }
      return { start, end };
    });

  const ids = idsSection
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => Number(line.trim()));

  return { ranges, ids };
}

function countFreshIds(ranges, ids) {
  const normalized = ranges
    .map((range) => (range.start <= range.end ? range : { start: range.end, end: range.start }))
    .sort((a, b) => a.start - b.start);

  let merged = [];
  for (const range of normalized) {
    if (merged.length === 0 || range.start > merged[merged.length - 1].end + 1) {
      merged.push({ ...range });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, range.end);
    }
  }

  return ids.reduce((count, id) => {
    if (Number.isNaN(id)) {
      return count;
    }

    let left = 0;
    let right = merged.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const range = merged[mid];
      if (id < range.start) {
        right = mid - 1;
      } else if (id > range.end) {
        left = mid + 1;
      } else {
        return count + 1;
      }
    }

    return count;
  }, 0);
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const { ranges, ids } = parseInput(inputPath);
  if (ranges.length === 0 || ids.length === 0) {
    console.log('0');
    return;
  }

  const result = countFreshIds(ranges, ids);
  console.log(result.toString());
}

main();
