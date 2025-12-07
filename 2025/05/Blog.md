# Advent of Code 2025 - Day 5: Cafeteria

Day 5 felt like running a little data pipeline: we ingest ranges, normalize them, and answer two slightly different queries.

## Part 1 – Checking the available IDs
The database lists “fresh” ID ranges followed by a blank line and then the list of available items we need to classify. My approach:
1. Parse the ranges and IDs.
2. Sort and merge overlapping or adjacent ranges so we end up with disjoint intervals.
3. For each ID, run a binary search to see whether it lands inside any merged interval.

**Complexity:** Merging ranges costs `O(R log R)` where `R` is the number of range lines. Each ID lookup is `O(log R)`, so the total runtime is `O(R log R + I log R)`; memory stays `O(R)` for the merged intervals.

## Part 2 – Counting every fresh ID
Now the available ID list is irrelevant—we just need the size of the union of the ranges themselves. The solution reuses the same merge logic but instead of querying IDs, it sums the inclusive length of each merged interval. Because the range values can be huge, everything runs in `BigInt` to avoid overflow.

**Complexity:** Parsing plus merging still costs `O(R log R)`, and summing the merged intervals is `O(R)` time with `O(R)` memory.

## Why it works well
- Both parts share the same normalized view of the ranges, so the second script is basically “merge once, sum once”.
- Binary search keeps the first part fast even when the list of available IDs is large.
- Using `BigInt` in Part 2 future-proofs the code against absurd range sizes.

With the inventory reports reconciled, the kitchen can finally stop bugging me about which ingredients are fresh.
