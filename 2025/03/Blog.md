# Advent of Code 2025 - Day 3: Lobby

I spent Day 3 hanging out in the lobby with a pile of battery banks and a stubborn escalator. Here is how I cracked both puzzles using a pair of lean JavaScript scripts (`part1.js` and `part2.js`).

## Part 1 – Two batteries, one number
Each bank is a string of digits. I needed the largest possible two-digit value that preserves order. Rather than evaluate every pair, I sweep the string once while tracking the best "first" digit seen so far. Every new digit forms a candidate pair with that best digit; if the candidate beats the running maximum, I store it, and if the new digit is even better as a first digit, I promote it. This greedy pass extracts the answer for a bank in linear time.

**Complexity:** For `n` banks whose lengths sum to `L`, the runtime is `O(L)` and the extra memory stays at `O(1)`.

## Part 2 – Twelve digits to rule the escalator
The safety override demanded far more juice: exactly twelve digits per bank. This morphs into the classic "remove k digits to maximize the remaining sequence" problem. I used a monotonic stack:

1. `k = bank.length - 12` is how many digits must be discarded.
2. While the stack's last digit is smaller than the current digit and I still have removals left, pop it.
3. Push the current digit.
4. After processing the whole bank, trim any extra digits from the end until only twelve remain.

Converting the resulting 12-digit string to `BigInt` kept the totals precise, and summing across all banks produced the final answer.

**Complexity:** The same total input length `L` drives this part. Each digit is pushed and popped at most once, so the runtime is `O(L)` with `O(12)` extra storage per bank (effectively `O(1)`).

## Lessons learned
- Greedy strategies shine when the problem boils down to keeping digits in order but maximizing lexicographic value.
- The same parsing foundation (reading banks from `input.txt`) can feed both parts with different solving strategies.
- `BigInt` is a great safety net when puzzle outputs can exceed 64-bit integers.

With both parts done, the escalator has all the joltage it needs—and I get to keep moving deeper into the North Pole base.
