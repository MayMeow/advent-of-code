<?php

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

// $input = $test2;
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
$currentPoint ='AAA';
while ($currentPoint != 'ZZZ') {
    $currentPoint = move($currentPoint, $map, $leftRight[$i]);
    $i++;
    if ($i >= strlen($leftRight) ) {
        $i = 0;
    }

    $steps++;
    echo $steps . ' - ' . $currentPoint . PHP_EOL;
}

function move($startpoint, $map, $leftRight)
{
    $point = array_search($startpoint, array_column($map, 'point'));
    return $map[$point][$leftRight];
}

echo "Steps: $steps";