const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const raw = fs.readFileSync(inputPath, 'utf8').trim();
const lines = raw.split(/\r?\n/).filter(Boolean);

function parseMachine(line) {
  const indicatorMatch = line.match(/\[([.#]+)\]/);
  if (!indicatorMatch) {
    throw new Error(`Missing indicator lights in line: ${line}`);
  }
  const indicator = indicatorMatch[1];
  const specPart = line.split('{')[0];
  const buttonMatches = [...specPart.matchAll(/\(([0-9,\s]+)\)/g)];
  if (buttonMatches.length === 0) {
    throw new Error(`No buttons found in line: ${line}`);
  }
  const target = indicatorToMask(indicator);
  const buttons = buttonMatches.map((match) => buttonToMask(match[1]));
  return { target, buttons };
}

function indicatorToMask(str) {
  let mask = 0n;
  for (let i = 0; i < str.length; i += 1) {
    if (str[i] === '#') {
      mask |= 1n << BigInt(i);
    }
  }
  return mask;
}

function buttonToMask(spec) {
  const indices = spec
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const value = Number(part);
      if (!Number.isInteger(value)) {
        throw new Error(`Invalid button index: ${spec}`);
      }
      return value;
    });
  let mask = 0n;
  for (const idx of indices) {
    mask |= 1n << BigInt(idx);
  }
  return mask;
}

function minButtonPresses(target, buttons) {
  if (target === 0n) {
    return 0;
  }
  const queue = [0n];
  const visited = new Map();
  visited.set(0n, 0);
  for (let i = 0; i < queue.length; i += 1) {
    const state = queue[i];
    const steps = visited.get(state);
    for (const button of buttons) {
      const next = state ^ button;
      if (visited.has(next)) {
        continue;
      }
      const nextSteps = steps + 1;
      if (next === target) {
        return nextSteps;
      }
      visited.set(next, nextSteps);
      queue.push(next);
    }
  }
  throw new Error('Target configuration is unreachable with given buttons.');
}

let total = 0;
for (const line of lines) {
  const { target, buttons } = parseMachine(line);
  total += minButtonPresses(target, buttons);
}

console.log(String(total));
