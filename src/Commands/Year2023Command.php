<?php
namespace MayMeow\AdventOfCode\Commands;

use MayMeow\AdventOfCode\Y2023\Day08\Day08;
use MayMeow\AdventOfCode\Y2023\Day09\Day09;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class Year2023Command extends Command
{
    protected function configure(): void
    {
        $this->setName('year:2023')
            ->setDescription('Advent of code 2023');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Advent of code 2023');

        $io->writeln('<fg=green>--- Day 1: Trebuchet?! ---</>');
        $io->writeln('<fg=green>--- Day 2: Cube Conundrum ---</>');
        $io->writeln('<fg=green>--- Day 3: Gear Ratios ---</>');
        $io->writeln('<fg=green>--- Day 4: Scratchcards ---</>');
        $io->writeln('<fg=green>--- Day 5: If You Give A Seed A Fertilizer ---</>');
        $io->writeln('<fg=green>--- Day 6: Wait For It ---</>');
        $io->writeln('<fg=green>--- Day 7: Camel Cards ---</>');
        $io->writeln('<fg=green>--- Day 8: Haunted Wasteland ---</>');
        $io->listing([
            'Part 1: ' . (new Day08())->part1(),
            'Part 2: '
        ]);
        $io->writeln('<fg=green>--- Day 8: Haunted Wasteland ---</>');
        $io->listing([
            'Part 1: ' . (new Day09())->part1(),
            'Part 2: '
        ]);

        return Command::SUCCESS;
    }
}