<?php

use PHPUnit\Event\Runtime\PHP;

$test = 'RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)';

$test2 = 'LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ';

$test3 = 'LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)';

$input = $test3;
// $input = file_get_contents('./input.txt');

// explode and remove empty values from array
$map = array_filter(explode("\n", $input));

$leftRight = $map[0];

$map = array_slice($map, 1);
$map = array_map(function ($value) {
    [$point, $lr] = explode(' = ', str_replace(['(', ')'], '', str_replace(['(', ')'], '', $value)));
    [$L, $R] = explode(', ', $lr);
    return compact('point', 'L', 'R');
}, $map);

$i = 0;
$steps = 0;
$startPoints = array_values(array_map(function ($value) {
    return $value;
}, array_filter($map, function ($value) {
    return substr($value['point'], -1) == 'A';
})));

$currentPoints = $startPoints;

$startPointsCount = count($startPoints);

$leftRightLength = strlen($leftRight);
$mapPoints = array_column($map, 'point');

while(!isEverythingAtEnd($currentPoints, $startPointsCount)) {
    foreach ($currentPoints as &$point) {
        $point = move2($point[$leftRight[$i % $leftRightLength]], $map, $mapPoints);
    }    

    $i = ($i + 1) % $leftRightLength;
    $steps ++;

    echo $steps . ' - ' . implode(', ', array_column($currentPoints, 'point')) . ' next to go to the: ' . $leftRight[$i] . PHP_EOL;
}

function move2($to, $map, $mapPoints)
{
    $point = array_search($to, $mapPoints); 
    return $map[$point];
}

function move($to, $map)
{
    $point = array_search($to, array_column($map, 'point')); 
    return $map[$point];
}

function isEverythingAtEnd($currentPoints, $startPointsCount) {
    $atTheEnd = array_filter($currentPoints, function ($value) {
        return substr($value['point'], -1) == 'Z';
    });

    if (count($atTheEnd) == $startPointsCount) {
        return true;
    }

    return false;
}

echo "Steps needed: $steps" . PHP_EOL;