<?php 

$test = '..F7.
.FJ|.
SJ.L7
|F--J
LJ...';

$input = $test;

// [-1,-1] [-1,0] [-1,1]
// [0,-1]  [0,0]  [0,1]
// [1,-1]  [1,0]  [1,1]

$pipes = [
    '|' => [[0, -1], [0, 1]], // up and down (N/S)
    '-' => [[-1, 0], [1, 0]], // left and right (W/E)
    'L' => [[-1, 0], [0, 1]], // 90 degree left (N/E)
    'J' => [[-1, 0], [0, -1]], // 90 degree right (N/W)
    '7' => [[1, 0], [0, -1]], // 90 degree left (S/W)
    'F' => [[1, 0], [0, 1]], // 90 degree right (S/E)
    '.' => [[0, 0]], // ground (no direction from here)
    'S' => [[0, 0]], // starting positifion
];

// 2D array
$map = array_map(function ($value) {
    return str_split($value);
}, explode("\n", $input));

foreach ($map as $index => $row) {
    if (in_array('S', $row)) {
        [$x, $y] = [$index, array_search('S', $row)];
    }
}


$start = $map[$x][$y];

function findNext($x, $y, $map, $pipes): array
{
    $next =[];
    foreach ($pipes as $index => $pipe)
    {
        foreach ($pipe as $dIndex => $direction) {
            [$dx, $dy] = $direction;
            [$dx, $dy] = [$x + $dx, $y + $dy];

            if ($x == $dx && $y == $dy) {
                continue;
            }

            if (!isset($map[$dx][$dy])) {
                continue;
            }

            if ($map[$dx][$dy] == '.') {
                continue;
            }

            $possibleNext = [
                'mx' => $dx,
                'my' => $dy,
                'p' => [$x, $y],
            ];

            if (array_search($possibleNext, $next) !== false) {
                continue;
            } else {
                $next[] = $possibleNext;

                $possibleNext = [];
            }
        }
    }
    

    return $next;
}

$next = findNext($x, $y, $map, $pipes);

echo 'Possible connections: ' . count($next) . PHP_EOL;
foreach ($next as $index => $value) {
    echo 'Possible connection ' . $index . ': ' . $value['mx'] . ' ' . $value['my'] . ' ' . $map[$value['mx']][$value['my']] . PHP_EOL;
}

// var_dump($next);

