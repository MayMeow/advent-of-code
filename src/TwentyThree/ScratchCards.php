<?php

namespace MayMeow\AdventOfCode\TwentyThree;

final class ScratchCards
{
    protected array $cards = [];

    public function __construct(
        protected string $input
    )
    {
        $this->input = $input;
    }

    public function getCards()
    {
        return $this->cards;
    }

    public function execute()
    {
        $cardsString = file_get_contents($this->input);
        $cardsString = explode("\n", trim($cardsString));

        // regex to extract card id from Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53 and remove it from string
        $regex = '/Card (\d+): (.*)/';

        foreach ($cardsString as $key => $card) {
            // remove all multiplied spaces
            $card = preg_replace('/\s+/', ' ', $card);

            preg_match($regex, $card, $matches);

            $numbers = explode('|', $matches[2]);

            $this->cards[] = [
                'id' => $matches[1],
                'numbers' => trim($numbers[0]),
                'knownNumbers' => trim($numbers[1]),
                'originalString' => $matches[0],
                'winningNumbers' => $this->getWinningNumbers($numbers[0], $numbers[1])
            ];
        }

        foreach ($this->cards as $key => $card) {
            $this->cards[$key]['value'] = $this->calculateCardValue($card);
        }

        return $this;
    }

    public function getWinningNumbers(string $cardNumbers, string $knownNumbers)
    {
        $numbers = explode(' ', $cardNumbers);
        $knownNumbers = explode(' ', $knownNumbers);
        $winningNumbers = [];

        // Warning SPOILER remove all items that are spaces only from array
        // Numbers under 10 will produce empty stirngs
        $numbers = array_filter($numbers, function($value) {
            return $value !== '';
        });

        //compareabove arrays and keep only numbers taht are in known numbers without foreach
        $winningNumbers = array_intersect($numbers, $knownNumbers);
        return $winningNumbers;
    }

    public function calculateCardValue(array $card)
    {
        $value = 0;
        if (count($card['winningNumbers']) == 0) {
            return 0;
        }

        // first one is always 1 and for each winning number multiply by 2
        for ($i = 0; $i <= count($card['winningNumbers']) - 1; $i++) {
            $value *= 2;

            if ($value == 0) {
                $value = 1;
            }
        }

        return $value;
    }

    public function getTotalValue()
    {
        $totalValue = 0;

        foreach ($this->cards as $card) {
            $totalValue += $card['value'];
        }

        return $totalValue;
    }
}