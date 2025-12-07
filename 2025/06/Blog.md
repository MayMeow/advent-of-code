# Day 6: Trash Compactor

## Summary
Day 6 brings us into a garbage compactor where we meet a family of cephalopods. To pass the time while they open the door, we help the youngest one with her math homework. The puzzle involves parsing a 2D grid of characters representing math problems. The twist is in how the numbers and operations are arranged spatially.

## Part 1
In Part 1, the problems are arranged horizontally but stacked vertically. Problems are separated by empty columns. Within a problem block, each line contains a number, and the bottom line contains the operator (`+` or `*`).

### Solution Approach
1.  **Grid Parsing**: Read the input file into a 2D grid (array of strings).
2.  **Problem Extraction**: Scan the grid column by column to identify "blank columns" (columns containing only spaces). These blank columns serve as delimiters between problems. We collect the start and end x-coordinates for each problem block.
3.  **Parsing Individual Problems**: For each block:
    *   Iterate through the rows.
    *   Parse the number on each row.
    *   Identify the operator at the bottom (either `+` or `*`).
4.  **Evaluation**: Apply the operator to the list of numbers (sum or product).
5.  **Aggregation**: Sum the results of all problems to get the grand total.

### Code Snippet (Problem Extraction)
```javascript
function extractProblems(grid) {
  const height = grid.length;
  const width = Math.max(...grid.map((line) => line.length));
  // ... helper to check if column is blank ...

  const problems = [];
  let x = 0;
  while (x < width) {
    // Skip blank columns
    while (x < width && isBlankColumn(x)) x += 1;
    if (x >= width) break;
    
    const start = x;
    // Find end of problem block
    while (x < width && !isBlankColumn(x)) x += 1;
    problems.push([start, x]);
  }
  return problems;
}
```

## Part 2
Part 2 reveals that we were reading the "cephalopod math" incorrectly. The structure is actually column-based and read right-to-left.
*   Each number is a vertical column (digits read top-to-bottom).
*   Problems are still separated by blank columns.
*   The operator is still at the bottom.

### Solution Approach
The logic is similar to Part 1 but rotated.
1.  **Right-to-Left Scanning**: We scan the grid from `width - 1` down to `0` to find problem boundaries.
2.  **Column-wise Number Parsing**: Within a problem block, we iterate through columns (right-to-left).
    *   For each column, read digits from top to bottom (excluding the last row which might contain the operator).
    *   Join the digits to form a number.
3.  **Operator Identification**: Check the bottom row of the current column for the operator.
4.  **Evaluation**: Same as Part 1 (sum or product of the collected numbers).

### Complexity Analysis
*   **Time Complexity**: $O(W \times H)$, where $W$ is the width and $H$ is the height of the grid. In both parts, we visit every cell in the grid a constant number of times (once to check for blank columns, and once to parse the content).
*   **Space Complexity**: $O(W \times H)$ to store the grid in memory. The storage for the parsed numbers is negligible compared to the grid itself.

## Key Takeaways
*   **Grid Manipulation**: This problem reinforces skills in navigating 2D grids, specifically handling arbitrary boundaries (blank columns) rather than fixed-size cells.
*   **Parsing Strategy**: Separating the "identification of boundaries" from the "parsing of content" made the code cleaner and easier to adapt for Part 2.
*   **Directionality**: Part 2 required a shift in perspective (vertical numbers, right-to-left reading), which was easily handled by adjusting the loop directions.
