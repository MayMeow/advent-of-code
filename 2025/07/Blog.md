# Day 7: Laboratories

## Summary
We find ourselves in a teleporter lab trying to fix a tachyon manifold. The puzzle input is a 2D grid representing the manifold. A tachyon beam starts at `S` and moves downwards. Empty space (`.`) allows the beam to continue straight down. However, splitters (`^`) stop the beam and create two new beams at the immediate left and right positions, which then continue downwards.

## Part 1
In Part 1, we need to determine how many splitters are "activated" by the beams. A splitter is activated if a beam reaches it.

### Solution Approach
We can simulate the beam propagation row by row. Since beams only move downwards (or diagonally down-left/down-right at splitters), we don't need a full graph traversal like BFS/DFS. We just need to track which columns contain active beams for the current row.

1.  **Find Start**: Locate the `S` in the grid to get the initial active column.
2.  **Row-by-Row Simulation**: Iterate from the row below `S` to the bottom.
3.  **Track Active Columns**: Use a `Set` to store the indices of columns that currently have a beam. A `Set` automatically handles the merging of beams (e.g., if two splitters send beams to the same spot).
4.  **Process Splitters**:
    *   For each active column `x` in the current row:
        *   If the cell is `^`: Increment the split counter. The beam splits to `x-1` and `x+1` for the next row.
        *   If the cell is `.`: The beam continues to `x` for the next row.
5.  **Boundary Checks**: Ensure split beams don't go out of bounds.

### Code Snippet
```javascript
function countSplits(grid) {
  // ... find start ...
  let active = new Set([startCol]);
  let splits = 0;

  for (let y = startRow + 1; y < grid.length; y += 1) {
    const next = new Set();
    for (const col of active) {
      const cell = grid[y][col];
      if (cell === '^') {
        splits += 1;
        if (col - 1 >= 0) next.add(col - 1);
        if (col + 1 < width) next.add(col + 1);
      } else {
        next.add(col);
      }
    }
    active = next;
  }
  return splits;
}
```

## Part 2
Part 2 asks for the total number of tachyon beams that reach the bottom of the manifold. Since beams split, this number can grow exponentially, so we need to handle large numbers.

### Solution Approach
Instead of tracking *where* beams are (boolean state), we track *how many* beams are at each column (integer state). This is a classic Dynamic Programming approach.

1.  **State Array**: Maintain an array `active` of size `width`, where `active[x]` represents the number of beams reaching column `x` at the current row. Initialize with `0`s, except `active[startCol] = 1`.
2.  **BigInt**: Use `BigInt` for counts because the number of beams can exceed the standard integer limit.
3.  **Transition**:
    *   Create a `next` array initialized to `0`.
    *   For each column `x` with `active[x] > 0`:
        *   If cell is `^`: Add `active[x]` to `next[x-1]` and `next[x+1]`.
        *   If cell is `.`: Add `active[x]` to `next[x]`.
4.  **Result**: Sum all values in the `active` array after processing the last row.

### Code Snippet
```javascript
function countTimelines(grid) {
  // ... setup ...
  let active = Array(width).fill(0n);
  active[startCol] = 1n;

  for (let y = startRow + 1; y < grid.length; y += 1) {
    const next = Array(width).fill(0n);
    for (let x = 0; x < width; x += 1) {
      if (active[x] === 0n) continue;
      
      const cell = grid[y][x];
      if (cell === '^') {
        if (x - 1 >= 0) next[x - 1] += active[x];
        if (x + 1 < width) next[x + 1] += active[x];
      } else {
        next[x] += active[x];
      }
    }
    active = next;
  }
  return active.reduce((sum, val) => sum + val, 0n);
}
```

## Complexity Analysis
*   **Time Complexity**: $O(H \times W)$, where $H$ is the height and $W$ is the width of the grid. We process each cell at most once per row iteration.
*   **Space Complexity**: $O(W)$. We only need to store the state of the current row (and the next row during transition).

## Key Takeaways
*   **Simulation vs. Counting**: Part 1 was a direct simulation of position (Set of indices), while Part 2 required counting paths (Map/Array of counts). This transition from "existence" to "quantity" is common in Advent of Code.
*   **BigInt**: Always be ready to use `BigInt` when a problem involves exponential growth (like splitting paths).
*   **Space Optimization**: Since the state of row `i` only depends on row `i-1`, we don't need a full $H \times W$ DP table; two arrays of size $W$ are sufficient.
