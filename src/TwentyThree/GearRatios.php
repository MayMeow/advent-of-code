<?php

namespace MayMeow\AdventOfCode\TwentyThree;

final class GearRatios
{
    protected array $numbers = [];

    public function getNumbers()
    {
        return $this->numbers;
    }

    public function getSumNubmers()
    {
        $sum = 0;

        foreach ($this->numbers as $number) {
            $sum += (int)$number['number'];
        }

        return $sum;
    }

    public function execute(string $input)
    {
        $engineSchematic = array_map('str_split', explode("\n", trim($input)));
        $stringRows = explode("\n", trim($input));

        $this->numbers = [];

        $rows = count($engineSchematic);
        $columns = count($engineSchematic[0]);
        $n = '';

        $start = [];
        $end = [];

        // find all numbers and their coordinates
        for ($i = 0; $i <= $rows -1; $i++) {
            for ($j = 0; $j <= $columns -1; $j++) {
                if (is_numeric($engineSchematic[$i][$j])) {
                    if ($n == '') {
                        $n = $engineSchematic[$i][$j];
                        $start = [$i, $j];
                    } else {
                        $n .= $engineSchematic[$i][$j];
                    }
                } else {
                    if ($n != '') {
                        $end = [$i, $j-1];
                        if($this->checkRow($stringRows[$i], $start[1], $end[1]) ||
                            $this->checkRange($i, $start[1], $end[1], $rows, $stringRows, false) ||
                            $this->checkRange($i, $start[1], $end[1], $rows, $stringRows, true)
                            ) {
                            $this->numbers[] = [
                                'number' => (int)$n,
                                'start' => $start,
                                'end' => $end
                            ];
                        }
                        $n = '';
                    }
                }
            }
        }

        return $this;
    }

    function checkRow(string $row, $start, $end)
    {
        // Check the characters before and after the range
        $before = $start > 0 ? $row[$start - 1] : '.';
        $after = $end <= strlen($row) -1 ? $row[$end + 1] : '.';

        //check both sides when position is not and start and and of the row
        if ($start > 0 && $end <= strlen($row) -1) {
            $before = $row[$start - 1];
            $after = $row[$end + 1];
        }

        // Return true if either character is not a '.'
        return $before != '.' || $after != '.';
    }

    function checkRange(string $row, $start, $end, $rowsCount, $rowsString, $above = false)
    {
        $atStart = $start == 0;
        $atEnd = $end == strlen($row);

        if ($atStart) {
            $end = $end + 1;
        } else if ($atEnd) {
            $start = $start - 1;
        } else {
            $end = $end + 1;
            $start = $start - 1;
        }
        $findRange = (int)$end - (int)$start+1;

        // check above
        if ($above == true && $row -1 >= 0) {
            $find = substr($rowsString[$row - 1], (int)$start, (int)$findRange);
            return preg_match('/[^.]/', $find);
        }

        // check bellow
        if ($above == false && $row + 1 < $rowsCount) {
            $find = substr($rowsString[$row + 1], (int)$start, (int)$findRange);
            return preg_match('/[^.]/', $find);
        }

        return false;
    }
}