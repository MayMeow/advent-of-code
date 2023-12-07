<?php

require_once 'vendor/autoload.php';
require_once 'config/app.php';

use MayMeow\AdventOfCode\TwentyThree\ScratchCards;
use MayMeow\AdventOfCode\TwentyThree\WaitForIt;

$sc = new ScratchCards(INPUTS . DS . 'Day4' . DS . 'input2.txt');
$wfi = new WaitForIt(INPUTS . DS . 'Day6' . DS . 'testInput.txt');

$input = '32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483';

$cards = "AKQJT98765432";

$cardValues = array_reverse(str_split($cards));
$cardValues = array_combine(range(1, count($cardValues)), $cardValues);

// parse input ad get card set value
$cardsSetsHave = [];
foreach (explode("\n", $input) as $line) {
    [$cards, $bid] = explode(' ', $line);

    // create numeric code for card set type
    $cardsT = str_split($cards);
    $cardsT = array_count_values($cardsT);
    // sort by value
    arsort($cardsT);

    /**
     * five of a kind 5
     * four of a kind 41
     * full house 32
     * three of a kind 311
     * two pair 221
     * one pair 2111
     */
    $setType = implode('', $cardsT);
    $setTypeValues = ['5', '41', '32', '311', '221', '2111'];

    // I.
    // sort cards by their value fom $cardValues and return string from sorted cards
    // not putting cards together
    $cards1 = str_split($cards);
    $sorted = usort($cards1, function ($a, $b) use ($cardValues) {
        return array_search($a, $cardValues) <=> array_search($b, $cardValues);
    });

    // var_dump(implode('', array_reverse($cards1)));

    // get totatl card set value
    $cardSetValue = array_reduce(str_split($cards), function ($carry, $item) use ($cardValues) {
        return $carry + array_search($item, $cardValues);
    });

    $cardsSetsHave[] = [$cards, $bid, $cardSetValue, $setType];

    /// sort array by card set value
    usort($cardsSetsHave, function ($a, $b) use ($setTypeValues) {
        return array_search($a[3], $setTypeValues) <=> array_search($b[3], $setTypeValues);
    });
}

var_dump(array_reverse($cardsSetsHave));

