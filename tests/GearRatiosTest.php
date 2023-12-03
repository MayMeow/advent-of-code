<?php

namespace MayMeow\AdventOfCode\Tests;

use MayMeow\AdventOfCode\TwentyThree\GearRatios;
use PHPUnit\Framework\TestCase;

class GearRatiosTest extends TestCase
{
    public function testAdjacendNumbersSum()
    {
        $gearRations = new GearRatios();

        $this->assertEquals(4361, $gearRations->execute(file_get_contents('inputs/Day3/input.txt'))->getSumNubmers());
        $this->assertEquals(4361, $gearRations->execute(file_get_contents('inputs/Day3/input2.txt'))->getSumNubmers());
    }
}