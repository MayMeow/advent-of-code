<?php

require_once 'vendor/autoload.php';
require_once 'config/app.php';

use MayMeow\AdventOfCode\TwentyThree\ScratchCards;
use MayMeow\AdventOfCode\TwentyThree\WaitForIt;

$sc = new ScratchCards(INPUTS . DS . 'Day4' . DS . 'input2.txt');
$wfi = new WaitForIt(INPUTS . DS . 'Day6' . DS . 'testInput.txt');

var_dump($wfi->executePart2());
