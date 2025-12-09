# Day 9: Movie Theater

## Summary
North Pole interior decorators handed me a loop of red tiles laid out on a huge floor. Part 1 wanted the largest axis-aligned rectangle that uses any two red tiles as opposite corners. Part 2 limited the rectangle to stay entirely inside the red/green walkway (the red tiles plus the green paths between them).

## Part 1 – Any rectangle between red corners
1. **Parse coordinates.** Each line is `x,y`. I stored them as `{x, y}` objects.
2. **Brute-force pairs.** Every pair of red tiles defines a candidate rectangle. The inclusive area is `(abs(dx)+1) * (abs(dy)+1)`.
3. **Track the maximum.** No validation is needed beyond the coordinates themselves.

**Complexity.** For `n` red tiles, the nested loop runs in `O(n^2)` time with `O(1)` extra space, which is fine for AoC-sized inputs. I used `BigInt` for the final area in case the floor is massive.

**Implementation.** `part1.js` adheres to the repository conventions: optional input path, synchronous read, and string output.

## Part 2 – Only red/green tiles allowed
The twist: the rectangle must be entirely within the red+green corridor. The list connects each red tile to the next via straight horizontal or vertical lines, wrapping around to form a closed loop. All tiles on the loop and the entire interior are allowed; everything else is off-limits.

**Approach.**
1. **Segment reconstruction.** Rebuild the path as axis-aligned segments between consecutive red points.
2. **Coordinate compression.** Instead of building a massive grid, collect all interesting x/y boundaries (tile edges plus padding) and index them. This keeps the grid manageable, even if coordinates are large.
3. **Mark walkway & interior.** Fill in compressed cells that the segments cover. Then run a flood-fill from the padded exterior to mark outside space; anything not reachable plus the walkway itself counts as allowed (red or green).
4. **Prefix sums.** Build a weighted prefix-sum grid where each cell stores its actual tile area. This lets me query the allowed area of any rectangle in `O(1)` time.
5. **Check pairs again.** For each pair of red points, compute the rectangle’s total area and compare it with the allowed-area query. If they match, the rectangle lies entirely inside the red/green region.

**Complexity.** Coordinate compression limits the grid to `O(n)` cells along each axis, so flood-fill and prefix construction are roughly linear in the number of compressed cells. Pair checking is still `O(n^2)` but the area validation becomes constant-time thanks to prefix sums.

**Implementation.** `part2.js` encapsulates the compression, BFS, and prefix logic while sticking to the same CLI pattern as Part 1.

## Takeaways
- When coordinates are huge, coordinate compression keeps the grid manageable without losing exact geometry.
- Prefix sums turned “is every tile allowed?” into a single arithmetic comparison.
- Both parts reuse the brute-force pairing of red tiles; the difference lies entirely in how strict we are about what’s inside the rectangle.
