# Advent of Code 2025 - Day 2: Gift Shop

Day 2 was all about spotting playful ID patterns inside huge numerical ranges. Here’s how both parts came together.

## Input parsing shared by both parts
The puzzle input is one comma-separated line of inclusive ranges (`start-end`). I parse everything as `BigInt` so that the gigantic IDs stay precise. After that, each part does its own math on top of the same parsed data.

## Part 1 – Double-half IDs
**Condition.** An ID is invalid if it is exactly two copies of some digit string (e.g., `64 64`). If the repeated block has length `h`, then the ID equals `pattern * 10^h + pattern`.

**Approach.** For every range I loop over all feasible `h` (up to half the digit count of the range’s end). For each `h`:
1. The pattern must be between `10^{h-1}` and `10^h - 1`.
2. The ID multiplier is `10^h + 1`. Valid patterns are those where `start <= multiplier * pattern <= end`.
3. Because the multiplier is constant, I can intersect `[start/multiplier, end/multiplier]` with the valid pattern bounds and use arithmetic-series sums to add up the corresponding IDs.

The final sum is just the accumulation of all these chunks across every range.

**Complexity.** Let `R` be the number of ranges and `D` the maximum digit count of any upper bound. The number of candidate half-lengths is `O(D)`, and each is processed with O(1) arithmetic. So the runtime is roughly `O(R * D)` and memory is `O(1)` besides the parsed data.

## Part 2 – Any repeated block (length ≥ 1)
**Condition.** IDs are invalid if they are made of some pattern repeated two or more times (e.g., `123123123`). These are numbers of the form `pattern * (10^{k*h-1} + ... + 1)` where `k` is the repeat count.

**Approach.** Instead of checking every ID, I enumerated pattern lengths (`h`) and repeat counts (`k`). The multiplier for a given `(h, k)` is `Σ_{i=0}^{k-1} 10^{i*h}`. For every range I intersect the pattern bounds with `[start/multiplier, end/multiplier]` to find all candidate patterns.

However, many IDs are representable with smaller periods, so I apply inclusion–exclusion: for each `(h, k)` I subtract contributions already accounted for by its proper divisors. Tracking partial sums in a map ensures every ID is counted exactly once.

**Complexity.** Enumerating base lengths and repeat counts still scales with `O(R * D^2)` in the worst case because there can be `O(D)` repeat counts per base length. The inclusion–exclusion bookkeeping adds a constant factor. Memory usage is `O(D^2)` for the memoized contributions.

## Takeaways
- Staying in the arithmetic domain (no brute-force per ID) is the only way to handle the enormous ranges.
- BigInt arithmetic makes these formulas safe and keeps the implementation close to the math definitions.
- Inclusion–exclusion is the trick that unlocks Part 2; otherwise numbers with smaller periods would be double-counted.

With both scripts (`part1.js` and `part2.js`) ready, it’s easy to run either variant and catch every mischievous pattern the young Elf left behind. On to the next floor!
