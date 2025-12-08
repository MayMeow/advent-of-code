<?php

declare(strict_types=1);

$test = "3   4\n4   3\n2   5\n1   3\n3   9\n3   3";

// $input = $test;
$input = @file_get_contents(__DIR__ . '/input.txt');
if ($input === false) {
    fwrite(STDERR, "Unable to read input file." . PHP_EOL);
    exit(1);
}

$lines = array_filter(array_map('trim', explode("\n", $input)), static fn (string $line): bool => $line !== '');

$leftValues = [];
$rightCounts = [];

foreach ($lines as $line) {
    [$left, $right] = array_map('intval', preg_split('/\s+/', $line));
    $leftValues[] = $left;
    $rightCounts[$right] = ($rightCounts[$right] ?? 0) + 1;
}

$similarity = 0;
foreach ($leftValues as $value) {
    $similarity += $value * ($rightCounts[$value] ?? 0);
}

echo 'Similarity score: ' . $similarity . PHP_EOL;
