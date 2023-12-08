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

// $input = $test3;
$input = file_get_contents('./input.txt');

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
$currentPoint = array_values(array_map(function ($value) {
    return $value;
}, array_filter($map, function ($value) {
    return substr($value['point'], -1) == 'A';
})));

$startPoints = count($currentPoint);

while(!isEverythingAtEnd($currentPoint, $startPoints)) {
    foreach ($currentPoint as &$point) {
        $point = move($point[$leftRight[$i]], $map);
        array_values($currentPoint);
    }    

    $i++;
    if ($i >= strlen($leftRight) ) {
        $i = 0;
    }    
    $steps ++;

    echo $steps . ' - ' . implode(', ', array_column($currentPoint, 'point')) . ' next to: ' . $leftRight[$i] . PHP_EOL;
}

function move($to, $map)
{
    $point = array_search($to, array_column($map, 'point')); 
    return $map[$point];
}

function isEverythingAtEnd($currentPoints, $startPoints) {
    $atTheEnd = array_filter($currentPoints, function ($value) {
        return substr($value['point'], -1) == 'Z';
    });

    if (count($atTheEnd) == $startPoints) {
        return true;
    }

    return false;
}

echo "Steps needed: $steps" . PHP_EOL;