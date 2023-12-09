<?php

namespace MayMeow\AdventOfCode\Y2023\Day09;

use MayMeow\AdventOfCode\Utils\Day;
use MayMeow\AdventOfCode\Utils\DayInterface;

final class Day09 extends Day implements DayInterface
{
    public function initialize()
    {
        $this->loadInput('Day09', year: '2023');
    }

    public function part1()
    {
        $input = $this->input;

        $histories = array_map(function ($value) {
            return explode(' ', $value);
        }, explode("\n", $input));
        
        foreach ($histories as $index => $history) {
            $rows[$index][] = $history;
            $row = $history;
        
            while (array_sum($row) != 0) {
                $row = $this->calculateNexRow($row);
                $rows[$index][] = $row;
            }
        }

        $sum = 0;
        foreach ($rows as $index => $row) {
            $nextValue = 0;
            foreach ($row as $rowIndex => $rowValue) {
                $nextValue += $rowValue[array_key_last($rowValue)];
            }
            $sum += $nextValue;
        }

        return $sum;
    }

    protected function calculateNexRow($row)
    {
        $values = [];
        for ($i = 0; $i <= count($row) -2; $i++) {
            $s = $row[$i + 1] - $row[$i];
            $values[] = $s;
        }
    
        return $values;
    }
}