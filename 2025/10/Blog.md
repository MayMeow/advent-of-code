# Advent of Code 2025 - Day 10: Factory

Today’s puzzle felt like fixing two halves of the same machine: first we snap indicator lights into place with toggles, then we flip a lever and treat those same buttons like little add-one circuits. Two different algebra problems, one pile of schematics.

## Part 1 – Minimal toggles for the lights
1. Parse each line into the target light pattern plus the list of buttons, turning both into `BigInt` bitmasks so large switch panels stay precise.
2. Run a BFS per machine starting from the all-off mask, XOR-ing in each button mask to explore reachable states; the first time we hit the goal mask we know we spent the minimum presses.
3. Sum those per-machine minima to get the final answer of `461`.

**Complexity:** With `L` lights and `B` buttons, each BFS visits at most `2^L` states with `O(B)` transitions per state, which is fine because `L` is small (≤10 in the input). Memory matches the state space size.

## Part 2 – Dialing joltage with linear algebra
1. Ignore the indicator diagram and treat the buttons as columns of a matrix where `A[row][col] = 1` if that button bumps the `row` counter.
2. Perform Gauss–Jordan elimination over exact fractions to reach RREF and detect the pivot columns; this gives the affine solution space `Ax = target`.
3. Apply natural bounds (a button can’t be pressed more times than any counter it touches requires) and enumerate combinations for the free variables, plugging them back into the pivot equations to keep everything non-negative and integral.
4. Track the minimal total press count across all valid assignments; the best total across every machine sums to `16386`.

**Complexity:** RREF costs roughly `O(C * B^2)` per machine (`C` counters, `B` buttons). Enumerating the few free variables is exponential in their count, but in practice each machine exposes at most three, keeping the search tiny.

## Takeaways
- Bitmask BFS is perfect for “toggle to reach a pattern” puzzles where states are tiny but branching factors are awkward to reason about.
- The same wiring data becomes a linear system once presses accumulate instead of flip, so recognizing the algebra shift avoids brute-force explosions.
- Bounding free variables by each button’s tightest counter need keeps the Part 2 search space civilized.
- Exact arithmetic (fractions + `BigInt`) prevents rounding bugs when you’re juggling pivots and large counter values.

One factory hall lit up, two problem domains solved. On to the next floor of the advent calendar.
