---
title: "Advent of Code 2025 – Day 05"
date: 2025-12-05
tags: [aoc, advent-of-code, 2025]
---

# Advent of Code 2025 - Day 5: Cafeteria

Day 5 felt like running a little data pipeline: we ingest ranges, normalize them, and answer two slightly different queries.

## Part 1 – Checking the available IDs
The database lists “fresh” ID ranges followed by a blank line and then the list of available items we need to classify. My approach:
1. Parse the ranges and IDs.
2. Sort and merge overlapping or adjacent ranges so we end up with disjoint intervals.
3. For each ID, run a binary search to see whether it lands inside any merged interval.

**Complexity:** Merging ranges costs `O(R log R)` where `R` is the number of range lines. Each ID lookup is `O(log R)`, so the total runtime is `O(R log R + I log R)`; memory stays `O(R)` for the merged intervals.

## Part 2 – Counting every fresh ID
Now the available ID list is irrelevant—we just need the size of the union of the ranges themselves. The solution reuses the same merge logic but instead of querying IDs, it sums the inclusive length of each merged interval. Because the range values can be huge, everything runs in `BigInt` to avoid overflow.

**Complexity:** Parsing plus merging still costs `O(R log R)`, and summing the merged intervals is `O(R)` time with `O(R)` memory.

## Why it works well
- Both parts share the same normalized view of the ranges, so the second script is basically “merge once, sum once”.
- Binary search keeps the first part fast even when the list of available IDs is large.
- Using `BigInt` in Part 2 future-proofs the code against absurd range sizes.

With the inventory reports reconciled, the kitchen can finally stop bugging me about which ingredients are fresh.


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
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

```

</details>

<details>
<summary><strong>▶ Part 2 Code</strong></summary>

```js
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

```

</details>
