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

//  explode and remove empty values from array
$map = array_filter(explode("\n", $input));

$leftRight = $map[0];

$map = array_slice($map, 1);
$map = array_map(function ($value) {
    [$point, $lr] = explode(' = ', str_replace(['(', ')'], '', str_replace(['(', ')'], '', $value)));
    [$L, $R] = explode(', ', $lr);
    return compact('point', 'L', 'R');
}, $map);

// make tree
$tree = [];
foreach ($map as $value) {
    $tree[$value['point']] = [
        'L' => $value['L'],
        'R' => $value['R'],
    ];
}

// Breadth-First Search
function bfs($start, $end, $tree) {
    $queue = new SplQueue();
    $queue->enqueue([$start]);
    $visited = [$start => true];

    while (!$queue->isEmpty()) {
        $path = $queue->dequeue();
        $node = end($path);

        if ($node == $end) {
            return $path;
        }

        foreach ($tree[$node] as $neighbour) {
            if (!isset($visited[$neighbour])) {
                $visited[$neighbour] = true;
                $newPath = $path;
                $newPath[] = $neighbour;
                $queue->enqueue($newPath);
            }
        }
    }

    return null;
}

$startNodes = array_filter(array_keys($tree), function($node) { return substr($node, -1) == 'A'; });
$endNodes = array_filter(array_keys($tree), function($node) { return substr($node, -1) == 'Z'; });

// listing all paths and theyr sizes
$pathSizes = [];
foreach ($startNodes as $start) {
    foreach ($endNodes as $end) {
        $path = bfs($start, $end, $tree);
        if ($path !== null) {
            $pathSizes[] = count($path) - 1;
            echo "Path from $start to $end: " . implode(' -> ', $path) . "\n";
        }
    }
}

// finding Least Common Multiple
function gcd($a, $b) {
    if ($b == 0) {
        return $a;
    } else {
        return gcd($b, $a % $b);
    }
}

function lcm($a, $b) {
    return abs($a * $b) / gcd($a, $b);
}

$lcm = array_reduce($pathSizes, function($lcm, $pathSize) {
    return lcm($lcm, $pathSize);
}, 1);

echo 'Steps per path: [' . implode(', ', $pathSizes) . "]\n";
echo "LCM: $lcm\n";




