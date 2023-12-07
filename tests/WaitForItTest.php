<?php

namespace MayMeow\AdventOfCode\Tests;

use MayMeow\AdventOfCode\TwentyThree\WaitForIt;
use PHPUnit\Framework\TestCase;

class WaitForItTest extends TestCase
{
    public function testInput()
    {
        $waitForIt = new WaitForIt('inputs/Day6/testInput.txt');

        $this->assertEquals(288, $waitForIt->execute());
        $this->assertEquals(71503, $waitForIt->executePart2());
    }

    public function testPart1()
    {
        $waitForIt = new WaitForIt('inputs/Day6/input.txt');

        $this->assertEquals(3317888, $waitForIt->execute());
        $this->assertEquals(24655068, $waitForIt->executePart2());
    }
}