<?php

require_once 'vendor/autoload.php';
require_once 'config/app.php';

use MayMeow\AdventOfCode\TwentyThree\ScratchCards;

$sc = new ScratchCards(INPUTS . DS . 'Day4' . DS . 'input2.txt');

$sc->execute();

var_dump($sc->getTotalValue());
