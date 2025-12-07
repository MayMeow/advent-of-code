# Advent of Code 2025 - Day 4: Printing Department

Forklifts, paper rolls, and lots of adjacency checks: Day 4 turned into a neat graph-like puzzle. Here’s how I solved both parts and what their complexity looks like.

## Part 1 – Finding accessible rolls
Each roll of paper is represented by `@` on a grid. A roll is accessible if fewer than four of the eight neighboring cells also contain rolls. The solver:
1. Parses the grid from `input.txt`.
2. Walks every cell; when it finds an `@`, it counts the occupied neighbors using the eight-direction offsets.
3. Increments the answer whenever the neighbor count is `< 4`.

**Complexity:** Let the grid be `H x W`. We inspect each cell once and examine up to eight neighbors, so runtime is `O(H * W)` with `O(1)` auxiliary memory.

## Part 2 – Removing rolls in waves
Part 2 asks for the total number of rolls that can be removed if we repeatedly remove any roll that’s currently accessible (i.e., has fewer than four neighbors). This is essentially a flood of “peeling” operations.

Steps:
1. Precompute, for every roll cell, how many neighboring rolls it has and store a boolean `active` flag.
2. Push every roll with `< 4` neighbors into a queue.
3. Pop from the queue; if the roll is still active and below the neighbor threshold, remove it. After removal, decrement the neighbor counts of its live neighbors and enqueue any that just fell below the threshold.
4. Continue until the queue empties; the removal counter is the answer.

This is equivalent to a BFS/queue-based propagation. Every cell enters the queue a bounded number of times and every edge (adjacent pair) is visited when counts change.

**Complexity:** Each roll is marked and potentially enqueued a few times, but every adjacency update happens at most once per removal. This keeps the runtime at `O(H * W)` with `O(H * W)` storage for the neighbor counts, active flags, and queue bookkeeping.

## Takeaways
- Both parts rely on the same grid parsing and eight-direction neighbor logic, so `part2.js` largely reuses the constants and helpers from `part1.js`.
- Treating the removal process like a queue-driven cascade avoids repeated rescans of the grid.
- The constraints are friendly enough that a straightforward implementation in Node stays fast, even for large inputs.

With the forklifts now able to reach (and remove) everything they need, the path to the cafeteria is clear.
