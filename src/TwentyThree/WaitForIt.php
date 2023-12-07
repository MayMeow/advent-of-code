<?php

namespace MayMeow\AdventOfCode\TwentyThree;

final class WaitForIt
{
    public function __construct(
        protected string $input
    )
    {
        $this->input = $input;
    }
    

    public function execute()
    {
        $input = file_get_contents($this->input);
        $input = explode("\n", trim($input));
        
        // parse input
        // replace myltiple spaces with one and then explode
        $times = explode(' ', explode(': ', preg_replace('/\s+/', ' ',$input[0]))[1]);
        $distances = explode(' ', explode(': ', preg_replace('/\s+/', ' ',$input[1]))[1]);

        $wins = $this->calculateWinsOpt($times, $distances);

        return $this->calculateTotalWaysToWin($wins);
    }

    public function executePart2()
    {
        $input = file_get_contents($this->input);
        $input = explode("\n", trim($input));

        // parse input
        // remove all spaces
        [$_, $times] = explode(':', preg_replace('/\s+/', '',$input[0]));
        [$_, $distances] = explode(':', preg_replace('/\s+/', '',$input[1]));

        // oh my god, this is so ugly but it wokrs (don't do that whis way)
        $wins = $this->calculateWinsOpt([$times], [$distances]);

        return $this->calculateTotalWaysToWin($wins);
    }

    /**
     * Calculate wins for each time
     *
     * Time: 00:03.198, Memory: 6.00 MB
     * 
     * @param [type] $times array of times
     * @param [type] $distances array of distances
     * @return array Return array that contains wins count for each time
     */
    public function calculateWins($times, $distances): array
    {
        $wins = [];
        foreach ($times as $key => $value) {
            $distance = $distances[$key]; // get distance for current time
            $count = 0;

            for ($i = 1; $i < $value; $i++) {
                $currentDistance = $this->calculateDistanceForHoldTime($i, $value);

                if ($currentDistance > $distance) {
                    $count++;
                }
            }
            $wins[] = $count;
        }

        return $wins;
    }

    // calculate wins using array_map and array_filter insted of cycles
    // Time: 00:05.496, Memory: 2.88 GB
    public function calculateWinsOpt($times, $distances): array
    {
        $wins = [];
        // go trough each time and calculate wins
        array_walk($times, function($value, $key) use (&$wins, $distances) {
            $distance = $distances[$key]; // get distance for current time
        
            // calculate maxDistances for each time
            $distancesArray = array_map(function($i) use ($value) {
                return $this->calculateDistanceForHoldTime($i, $value);
            }, range(1, $value - 1));
        
            // update count if win
            $count = count(array_filter($distancesArray, function($currentDistance) use ($distance) {
                return $currentDistance > $distance;
            }));
        
            $wins[] = $count;
        });

        return $wins;
    }
    
    /**
     * Undocumented function
     *
     * @param $buttonHold For how long you hold button in miliseconds
     * @param $time Time of current race in miliseconds
     * @return int|string Distance in miliseconds, Button hold * remaining time of race
     */
    public function calculateDistanceForHoldTime ($buttonHold, $time): int|string
    {
        $remainingTime = $time - $buttonHold;

        return $buttonHold * $remainingTime;
    }

    // Determine the number of ways you could beat the record in each race
    public function calculateTotalWaysToWin(array $wins)
    {
        $total = 1;
        foreach ($wins as $key => $value) {
            $total *= $value;
        }

        return $total;
    }
}