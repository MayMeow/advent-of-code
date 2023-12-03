<?php

use MayMeow\AdventOfCode\TwentyThree\GearRatios;

require 'vendor/autoload.php';

$day3 = new GearRatios();

$file = file_get_contents('inputs/Day3/input.txt');


$numbers = $day3->execute($file);



// numer is given with two coordinates S[x1,y1] and E[x2,y2]
// find row neighbors just check symbols on the same row S[x1-1,y1] and E[x2+1,y2]
// diagnoal neighbor above check everything between S[x1-1,y1-1] and E[x2+1,y2+1]
// diagnoal neighbor bellow check everything between S[x1+1,y1-1] and E[x2-1,y2+1]


foreach ($numbers->getNumbers() as $number) {
    echo $number['number'] . ' S('. $number['start'][0] . ',' . $number['start'][1] . ') E(' . $number['end'][0] . ',' . $number['end'][1] . ")\n";
}

echo $numbers->getSumNubmers();

// now we have nubers and their coordinates
/*
467 S(0,0) E(0,3)  check substr on 0 to 3 if contains symbol different form .
114 S(0,5) E(0,8)
35 S(2,2) E(2,4)
633 S(2,6) E(2,9)
617 S(4,0) E(4,3)
58 S(5,7) E(5,9)
592 S(6,2) E(6,5)
755 S(7,6) E(7,9)
664 S(9,1) E(9,4)
598 S(9,5) E(9,8)
*/
