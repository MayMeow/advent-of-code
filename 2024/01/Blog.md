# Advent of Code 2024 - Day 1: Historian Hysteria

Day 1 is the classic list-reconciliation warm-up: two columns of location IDs that don’t quite match. Part 1 measures how far apart the lists are after sorting; Part 2 rewards numbers that appear in both lists.

## Part 1 – Total distance between lists
1. **Parse the pairs.** Read every line, split on whitespace, and keep the left and right values in two arrays.
2. **Sort independently.** Sorting each list ensures we compare matching ranks (smallest-to-smallest, etc.).
3. **Sum absolute gaps.** Walk the arrays in lockstep and accumulate `abs(left[i] - right[i])`.

**Complexity.** Sorting dominates at `O(n log n)` per list with `O(n)` memory for the arrays; the final pass is linear.

**Implementation.** `Part1.php` reads `input.txt`, builds the arrays, sorts them with `sort`, and prints the total distance.

## Part 2 – Similarity score
1. **Count right-side frequencies.** For every line, increment a hash map keyed by the right value.
2. **Scan the left list.** For each left value, multiply it by `frequency[rightValue]` (default `0`) and add that product to the running total.

**Complexity.** Both passes are linear: `O(n)` time and `O(k)` memory where `k` is the number of distinct right-side values.

**Implementation.** `Part2.php` shares the same parser but skips sorting; instead it keeps the right counts in an associative array and streams the similarity sum.

## Takeaways
- Sorting both lists once makes the distance calculation trivial—no need for fancy matching.
- Hash maps turn the similarity scoring into a single linear pass.
- Both scripts stick to plain PHP and read from the local `input.txt`, so testing is just `php Part1.php` / `php Part2.php` inside `2024/01`.
