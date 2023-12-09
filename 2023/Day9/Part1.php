<?php

$test = '0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45';

// $input = $test;
$input = file_get_contents('./input.txt');

$histories = array_map(function ($value) {
    return explode(' ', $value);
}, explode("\n", $input));

foreach ($histories as $index => $history) {
    $rows[$index][] = $history;
    $row = $history;

    while (array_sum($row) !== 0) {
        $row = calculateNexRow($row);
        $rows[$index][] = $row;
    }
}

function calculateNexRow($row)
{
    $values = [];
    for ($i = 0; $i <= count($row) -2; $i++) {
        $s = $row[$i + 1] - $row[$i];
        $values[] = $s;
    }

    return $values;
}

$sum = 0;
foreach ($rows as $index => $row) {
    $nextValue = 0;
    foreach ($row as $rowIndex => $rowValue) {
        $nextValue += $rowValue[array_key_last($rowValue)];
    }
    $sum += $nextValue;
}

echo 'Sum: ' . $sum . PHP_EOL;
