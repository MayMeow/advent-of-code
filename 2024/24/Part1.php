<?php

declare(strict_types=1);

$test = <<<INPUT
x00: 1
x01: 1
x02: 1
y00: 0
y01: 1
y02: 0

x00 AND y00 -> z00
x01 XOR y01 -> z01
x02 OR y02 -> z02
INPUT;

// $input = $test;
$input = @file_get_contents(__DIR__ . '/input.txt');

if ($input === false) {
    fwrite(STDERR, "Unable to read input file." . PHP_EOL);
    exit(1);
}

$parts = preg_split("/\R\R/", trim($input), 2);

if ($parts === false || count($parts) < 2) {
    fwrite(STDERR, "Input format unexpected." . PHP_EOL);
    exit(1);
}

$initialWireLines = preg_split("/\R/", trim($parts[0]));
$gateLines = preg_split("/\R/", trim($parts[1]));

$initialWireLines = $initialWireLines === false ? [] : array_filter($initialWireLines, 'strlen');
$gateLines = $gateLines === false ? [] : array_filter($gateLines, 'strlen');

$wires = [];
foreach ($initialWireLines as $line) {
    [$wire, $value] = array_map('trim', explode(':', $line));
    $wires[$wire] = (int)$value;
}

$gates = [];
$pattern = '/^(\w+)\s+(AND|OR|XOR)\s+(\w+)\s+->\s+(\w+)$/';
foreach ($gateLines as $line) {
    if (!preg_match($pattern, $line, $matches)) {
        fwrite(STDERR, "Invalid gate definition: {$line}" . PHP_EOL);
        exit(1);
    }
    $gates[] = [
        'left' => $matches[1],
        'op' => $matches[2],
        'right' => $matches[3],
        'out' => $matches[4],
    ];
}

resolveGates($gates, $wires);

$zWires = array_filter(
    $wires,
    static fn (int $value, string $wire): bool => startsWithZ($wire),
    ARRAY_FILTER_USE_BOTH
);

if (empty($zWires)) {
    fwrite(STDERR, "No z wires present in the resolved network." . PHP_EOL);
    exit(1);
}

uksort($zWires, static function (string $a, string $b): int {
    return parseWireIndex($a) <=> parseWireIndex($b);
});

$bits = array_values($zWires);
$decimal = bitsToDecimalString($bits);

$binary = implode('', array_reverse(array_map(static fn (int $bit): string => (string)$bit, $bits)));

echo 'Decimal output: ' . $decimal . PHP_EOL;
echo 'Binary output : ' . $binary . PHP_EOL;

function resolveGates(array $gates, array &$wires): void
{
    $pending = $gates;
    while (!empty($pending)) {
        $progress = false;
        foreach ($pending as $index => $gate) {
            if (array_key_exists($gate['left'], $wires) && array_key_exists($gate['right'], $wires)) {
                $wires[$gate['out']] = applyGate($wires[$gate['left']], $wires[$gate['right']], $gate['op']);
                unset($pending[$index]);
                $progress = true;
            }
        }

        if (!$progress) {
            fwrite(STDERR, 'Cannot resolve remaining gates; check for missing inputs.' . PHP_EOL);
            exit(1);
        }
    }
}

function applyGate(int $left, int $right, string $operator): int
{
    return match ($operator) {
        'AND' => ($left & $right),
        'OR' => ($left | $right),
        'XOR' => ($left ^ $right),
        default => throw new RuntimeException('Unsupported operator: ' . $operator),
    };
}

function startsWithZ(string $wire): bool
{
    return $wire !== '' && $wire[0] === 'z';
}

function parseWireIndex(string $wire): int
{
    return (int)preg_replace('/^z/', '', $wire);
}

function bitsToDecimalString(array $bits): string
{
    $decimal = '0';
    foreach (array_reverse($bits) as $bit) {
        $decimal = stringDoubleAddBit($decimal, $bit);
    }

    return $decimal;
}

function stringDoubleAddBit(string $number, int $bit): string
{
    $carry = $bit;
    $result = '';

    for ($i = strlen($number) - 1; $i >= 0; $i--) {
        $digit = (int)$number[$i];
        $value = $digit * 2 + $carry;
        $result = ($value % 10) . $result;
        $carry = intdiv($value, 10);
    }

    if ($carry > 0) {
        $result = $carry . $result;
    }

    return ltrim($result, '0') ?: '0';
}
