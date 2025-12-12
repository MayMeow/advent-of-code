# Advent of Code 2025 - Day 12: Christmas Tree Farm

Tetris, but make it elves. Today was all about figuring out whether oddly shaped presents could tile a given rectangle without overlaps. On paper it sounds like a straight polyomino packing question; in practice it turned into a tour through three different solvers and a bunch of benchmarking.

## Part 1 – How many regions work?
1. Parse the shape catalog once, generating all unique rotations and reflections so every piece can be dropped anywhere on the board.
2. For each region, enumerate every legal placement for each requested shape. If a shape can’t be placed at least as many times as requested, we bail out early.
3. Search for a placement combination that satisfies all quotas without overlapping.

I tried three versions of the search:

- **v1 (baseline)** – board-first DFS. I picked a shape, tried every placement, marked `board[cell] = 1`, and backtracked. It was simple but took ~17 seconds on my input.
- **v2 (conflict tracker)** – still single-threaded, but now each placement knew all other placements it blocked. Applying/removing a placement updated per-shape availability counts so the "choose the most constrained shape" heuristic stayed honest. Runtime dropped to ~5.5 seconds.
- **v3 (bitmask + workers)** – I rewrote the solver to use `BigInt` bitmasks and fanned regions out across worker threads. Surprisingly, the coordination overhead plus a more generic search pushed the runtime back up to ~15 seconds. Cool experiment, but v2 is still the champ.

Final tally: **451 regions** can fit their assigned piles of presents. The sample input still reports `2`, which was a good sanity check after each rewrite.

**Complexity:** Let `P` be the number of precomputed placements for a region and `S` the number of requested presents. Placement generation is `O(P)` and the search is exponential in `S`, but pruning by shape availability keeps the tree manageable in practice (most regions cap out under a few thousand nodes).

## Optimization Notes
- Enumerate placements once; it’s cheaper than trying to be clever mid-search.
- Track conflicts at the placement level instead of constantly rescanning the board.
- Parallelism only helped when there were enough regions per worker—otherwise the setup cost overshadowed the gains.

That’s day 12: a polyomino packing gauntlet, one satisfied region count, and a good reminder to trust profiling over gut feelings when optimizing search code.
