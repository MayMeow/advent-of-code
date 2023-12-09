<?php

namespace MayMeow\AdventOfCode\Y2023\Day08;

use MayMeow\AdventOfCode\Utils\Day;
use MayMeow\AdventOfCode\Utils\DayInterface;

final class Day08 extends Day implements DayInterface
{
    public function initialize()
    {
        $this->loadInput('Day08', year: '2023');
    }

    public function part1()
    {
        // explode and remove empty values from array
        $map = array_filter(explode("\n", $this->input));

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
            $currentPoint = $this->move($currentPoint, $map, $leftRight[$i]);
            $i++;
            if ($i >= strlen($leftRight) ) {
                $i = 0;
            }

            $steps++;
        }

        return $steps;
    }

    protected function move($startpoint, $map, $leftRight)
    {
        $point = array_search($startpoint, array_column($map, 'point'));
        return $map[$point][$leftRight];
    }
}