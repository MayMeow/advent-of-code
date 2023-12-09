<?php

namespace MayMeow\AdventOfCode\Utils;

abstract class Day
{
    protected string $input = '';

    public function initialize()
    {
    }

    public function __construct()
    {
        $this->initialize();
    }

    protected function loadInput(string $day = '', string $file = 'input.txt', string $year = '2020'): void
    {
        $file = dirname(dirname(__DIR__)) . DS . $year . DS . $day . DS . $file;
        $this->input = file_get_contents($file);
    }
}