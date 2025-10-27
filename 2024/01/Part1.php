<?php

$test = "3   4\n4   3\n2   5\n1   3\n3   9\n3   3";

// $input = $test;
$input = file_get_contents(__DIR__ . '/input.txt');

$lines = array_filter(array_map('trim', explode("\n", $input)));

$leftList = [];
$rightList = [];

foreach ($lines as $line) {
    [$left, $right] = array_map('intval', preg_split('/\s+/', $line));
    $leftList[] = $left;
    $rightList[] = $right;
}

// Sort both lists to pair entries from smallest to largest.
sort($leftList);
sort($rightList);

$totalDistance = 0;

foreach ($leftList as $index => $leftValue) {
    $totalDistance += abs($leftValue - $rightList[$index]);
}

echo 'Total distance: ' . $totalDistance . PHP_EOL;
