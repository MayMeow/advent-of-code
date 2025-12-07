# Day 1 – Secret Entrance (Part 1)

This puzzle provides a list of dial rotations. Each line starts with a direction character (`L` for left toward lower numbers, `R` for right toward higher numbers) followed by the number of clicks to move on a circular dial labeled `0`-`99`. The dial begins at position `50`, and the goal is to count how many times the dial ends up on `0` after applying every rotation.

## Algorithm
1. Read every non-empty line from the input file (`input.txt` by default).
2. For each instruction:
   - Separate the first character (direction) from the numeric distance.
   - Convert `L` moves into negative deltas, `R` moves into positive deltas.
   - Apply the delta to the current position and wrap it into the range `[0, 99]` using modular arithmetic.
   - If the resulting position equals `0`, increment the answer.
3. Print the final count of `0` positions.

This logic is implemented in `2025/01/part1.js`. The helper `rotate` function ensures the dial never leaves the `0`-`99` range, and `countZeroStops` performs the full scan of the input sequence.

## Complexity
Let `n` be the number of rotations. Each rotation is processed once, so the runtime is $O(n)$ and the memory footprint is $O(1)` aside from storing the instructions.

## Running the Solver
From the repository root:

```
node 2025/01/part1.js            # uses 2025/01/input.txt
node 2025/01/part1.js path/to/other-input.txt
```

For the example given in the puzzle description, the script prints `3`, matching the stated password.
