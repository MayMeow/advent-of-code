<?php 

$test = '..F7.
.FJ|.
SJ.L7
|F--J
LJ...';

$input = $test;
// $input = file_get_contents('input.txt');

// [-1,-1] [-1,0] [-1,1]
// [0,-1]  [0,0]  [0,1]
// [1,-1]  [1,0]  [1,1]

$pipes = [
    '|' => [[-1,0 ], [1, 0]], // up and down (N/S)
    '-' => [[0, -1], [0, 1]], // left and right (W/E)
    'L' => [[-1, 0], [0, 1]], // 90 degree left (N/E)
    'J' => [[-1, 0], [0, -1]], // 90 degree right (N/W)
    '7' => [[1, 0], [0, -1]], // 90 degree left (S/W)
    'F' => [[1, 0], [0, 1]], // 90 degree right (S/E)
    // '.' => [[0, 0]], // ground (no direction from here)
    'S' => [[0, 0]], // starting position - connect to all pipes based pipe's exits
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

$next = [];

function findNext($x, $y, $map, $pipes, $next): array
{
    $areConnected = function (array $start, array $destination) use ($map, $pipes): bool {
        [$x,$y] = $start;
        [$dx, $dy] = $destination;
        $pipe = $map[$dx][$dy];

        // / connected to each pipe when tere is connection from it
        if ($pipe == 'S') {
            return true;
        }

        foreach($pipes[$pipe] as $direction) {
            [$px, $py] = $direction;
            [$px, $py] = [$dx + $px, $dy + $py];

            if ($px == $x && $py == $y) {
                // echo 'Destination [' . $dx . ',' . $dy . '] ' . $pipe . PHP_EOL; 
                // echo 'Checking: location [' . $px . ',' . $py . '] against [' . $x . ',' . $y . ']' . PHP_EOL;
                return true;
            }
        }

        return false;
    };

    $getPipe = function($x, $y) use ($map, $pipes): array {
        $pipe = $map[$x][$y];

        if (!isset($pipes[$pipe]) || $pipe == 'S') {
            return $pipes;
        }

        return [$pipes[$pipe]];
    };

    foreach ($getPipe($x,$y) as $index => $pipe)
    {
        foreach ($pipe as $dIndex => $direction) {
            [$dx, $dy] = $direction;
            [$dx, $dy] = [$x + $dx, $y + $dy];

            // this is the same location
            if ($x == $dx && $y == $dy) {
                continue;
            }

            // skip if location not exists
            if (!isset($map[$dx][$dy])) {
                continue;
            }

            // skip if ground
            if ($map[$dx][$dy] == '.') {
                continue;
            }

            // check if both points are connected
            if (!$areConnected([$x, $y], [$dx, $dy])) {
                continue;
            }

            $possibleNext = [
                'mx' => $dx,
                'my' => $dy,
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

/*$x = 2;
$y = 1;
*/

/* foreach($map as $index => $row) {
    foreach($row as $rIndex => $value) {
        if ($value == '.') {
            continue;
        }
        $next = findNext($index, $rIndex, $map, $pipes, $next);
    }
}*/

$next = findNext($x, $y, $map, $pipes, $next);
echo count($next) . ' Possible connections for [' . $x . ',' . $y . ']' . ' ' . $map[$x][$y] . PHP_EOL;
foreach ($next as $index => $value) {
    echo 'Possible connection ' . $index . ': ' . $value['mx'] . ' ' . $value['my'] . ' ' . $map[$value['mx']][$value['my']] . PHP_EOL;
}

