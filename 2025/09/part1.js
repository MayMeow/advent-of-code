const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function parsePoints(raw) {
  return raw
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [xText, yText] = line.split(',');
      const x = Number(xText);
      const y = Number(yText);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`Invalid coordinate line: ${line}`);
      }
      return { x, y };
    });
}

function maxRectangleArea(points) {
  if (points.length < 2) {
    return 0n;
  }

  let best = 0n;
  for (let i = 0; i < points.length - 1; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const width = BigInt(Math.abs(points[i].x - points[j].x) + 1);
      const height = BigInt(Math.abs(points[i].y - points[j].y) + 1);
      const area = width * height;
      if (area > best) {
        best = area;
      }
    }
  }

  return best;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const raw = fs.readFileSync(inputPath, 'utf8').trim();
  if (!raw) {
    console.log('0');
    return;
  }

  const points = parsePoints(raw);
  const answer = maxRectangleArea(points);
  console.log(answer.toString());
}

main();
