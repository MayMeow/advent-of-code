<?php

namespace MayMeow\AdventOfCode\Tests;

use MayMeow\AdventOfCode\TwentyThree\ScratchCards;
use PHPUnit\Framework\TestCase;

class ScratchCardsTest extends TestCase
{

    protected ScratchCards $sc;

    public function setUp(): void
    {
        parent::setUp();

        $this->sc = new ScratchCards('inputs/Day4/input.txt');
        $this->sc->execute();
    }

    public function testTotalValue()
    {
        $this->assertEquals(13, $this->sc->getTotalValue());
    }

    public function testWiningNumbers()
    {
        $winingNumbertest = [
            ['48', '83', '86', '17'],
            ['32', '61'],
            ['1', '21'],
            ['84'],
            [],
            []
        ];

        $cards = $this->sc->getCards();

        for($i = 0; $i < count($winingNumbertest); $i++) {
            $this->assertEquals($winingNumbertest[$i], array_values($cards[$i]['winningNumbers']));
        }
    }
}