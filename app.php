<?php

use MayMeow\AdventOfCode\Commands\Year2023Command;
use Symfony\Component\Console\Application;

require_once 'vendor/autoload.php';

$application = new Application('Advent of code 🎄', '2023');

$application->add(new Year2023Command());

$application->run();