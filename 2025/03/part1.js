const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function readBanks(filePath) {
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

function maxTwoDigitValue(bank) {
    if (bank.length < 2) {
        return 0;
    }

    let bestPair = -1;
    let bestFirst = Number(bank[0]);

    for (let i = 1; i < bank.length; i += 1) {
        const digit = Number(bank[i]);
        const candidate = bestFirst * 10 + digit;
        if (candidate > bestPair) {
        bestPair = candidate;
        }
        if (digit > bestFirst) {
        bestFirst = digit;
        }
    }

    return bestPair;
}

function solve(banks) {
    return banks.reduce((sum, bank) => sum + maxTwoDigitValue(bank), 0);
}

function main() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exitCode = 1;
        return;
    }

    const banks = readBanks(inputPath);
    if (banks.length === 0) {
        console.log('0');
        return;
    }

    const result = solve(banks);
    console.log(result.toString());
}

main();
