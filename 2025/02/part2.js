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

const pow10Cache = new Map([[0, 1n]]);

function pow10(exp) {
    if (pow10Cache.has(exp)) {
        return pow10Cache.get(exp);
    }
    const value = pow10(exp - 1) * 10n;
    pow10Cache.set(exp, value);
    return value;
}

function ceilDiv(a, b) {
    if (a >= 0n) {
        return (a + b - 1n) / b;
    }
    return a / b;
}

function sumArithmetic(first, last) {
    const count = last - first + 1n;
    return (first + last) * count / 2n;
}

function getProperDivisors(n) {
    const divisors = [];
    for (let d = 1; d * d <= n; d += 1) {
        if (n % d !== 0) {
        continue;
        }
        if (d !== n) {
        divisors.push(d);
        }
        const other = n / d;
        if (other !== d && other !== n) {
        divisors.push(other);
        }
    }
    return divisors;
}

function sumInvalidInRange(start, end) {
    if (start > end) {
        return 0n;
    }

    const primitiveMap = new Map();
    const maxDigits = end.toString().length;
    const maxBaseLen = Math.floor(maxDigits / 2);
    let total = 0n;

    for (let baseLen = 1; baseLen <= maxBaseLen; baseLen += 1) {
        const maxRep = Math.floor(maxDigits / baseLen);
        if (maxRep < 2) {
        continue;
        }

        const minPattern = pow10(baseLen - 1);
        const maxPattern = pow10(baseLen) - 1n;
        const powStep = pow10(baseLen);

        const multipliers = new Array(maxRep + 1).fill(0n);
        let multiplier = 1n;
        let power = 1n;
        multipliers[1] = 1n;
        for (let rep = 2; rep <= maxRep; rep += 1) {
        power *= powStep;
        multiplier += power;
        multipliers[rep] = multiplier;
        }

        const divisors = getProperDivisors(baseLen);

        for (let repCount = 2; repCount <= maxRep; repCount += 1) {
        const multi = multipliers[repCount];
        if (!multi) {
            primitiveMap.set(`${baseLen}|${repCount}`, 0n);
            continue;
        }

        let first = ceilDiv(start, multi);
        if (first < minPattern) {
            first = minPattern;
        }

        let last = end / multi;
        if (last > maxPattern) {
            last = maxPattern;
        }

        if (first > last) {
            primitiveMap.set(`${baseLen}|${repCount}`, 0n);
            continue;
        }

        let sumAll = sumArithmetic(first, last) * multi;

        for (const divisor of divisors) {
            const factor = baseLen / divisor;
            if (factor * divisor !== baseLen) {
            continue;
            }
            const relatedRep = repCount * factor;
            const subtract = primitiveMap.get(`${divisor}|${relatedRep}`) ?? 0n;
            sumAll -= subtract;
        }

        primitiveMap.set(`${baseLen}|${repCount}`, sumAll);
        total += sumAll;
        }
    }

    return total;
}

function solve(ranges) {
    return ranges.reduce((acc, range) => acc + sumInvalidInRange(range.start, range.end), 0n);
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
