const fs = require('fs');
const path = require('path');

const DIGITS_TO_SELECT = 12;
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

function bestTwelveDigits(bank) {
    if (bank.length <= DIGITS_TO_SELECT) {
        return BigInt(bank);
    }

    const stack = [];
    let remaining = bank.length - DIGITS_TO_SELECT;

    for (const char of bank) {
        const digit = char;
        while (stack.length && remaining > 0 && stack[stack.length - 1] < digit) {
        stack.pop();
        remaining -= 1;
        }
        stack.push(digit);
    }

    while (stack.length > DIGITS_TO_SELECT) {
        stack.pop();
    }

    return BigInt(stack.join(''));
}

function solve(banks) {
    return banks.reduce((sum, bank) => sum + bestTwelveDigits(bank), 0n);
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
