# Advent of Code 2025 - Day 11: Reactor Relays

Today’s problem looked like a straight "count the wire paths" exercise, but the density of the wiring diagram quickly turned it into a combinatorics workout. I ended up treating the factory like a directed acyclic graph of devices and tallying every simple route from the starting node to the `out` device.

## Part 1 – Enumerating simple routes
1. Parse each `src: tgt1 tgt2 ...` line into an adjacency list so every device knows its outgoing neighbors.
2. Run a depth-first search from `you`, carrying along a `Set` of visited nodes so each path remains simple (no revisiting devices). Whenever the recursion reaches `out`, increment the total.
3. Backtracking un-marks the node, letting the search explore the rest of the tree without cloning sets on every call. The final count lands at `566` paths.

**Complexity:** Let `N` be the number of devices reachable from `you` and `P` the number of simple paths. The DFS explores each path exactly once, so the time is \(O(P)\) and memory stays at \(O(N)\) for the recursion stack plus the visited set.

## Part 2 – Both converters or bust
This half was a bear. The raw DFS that worked for Part 1 now had to consider every `svr → out` path while *also* ensuring the path visits both `dac` and `fft`. The graph has hundreds of devices, so the naive search took ages and even the AI assistant kept producing versions that blew up. The breakthrough came when I stopped trying to enumerate the paths directly and instead counted them with dynamic programming over the DAG.

1. Build both forward and reverse adjacency lists. From `svr`, collect everything reachable; from `out`, collect everything that can feed it. Intersecting the two gives the subgraph that can possibly contribute to valid paths, immediately discarding dead ends.
2. Topologically sort that subgraph (the puzzle input is acyclic). If the sort ever fails—just in case of rogue cycles—fall back to the DFS variant to keep correctness.
3. Traverse nodes in topo order, letting each node carry four counters that represent whether a path has touched `dac`, `fft`, both, or neither. When propagating counts to neighbors, OR in the neighbor’s requirement bits. Using `BigInt` keeps the totals precise, because the number of qualifying paths is enormous. The final answer is `331837854931968`.

**Complexity:** The pruning plus topological DP visits each usable edge once, so the runtime is \(O(N + E)\) with a tiny constant for the four requirement states. Memory is \(O(N)\) for the per-node counters.

## Takeaways
- Simple-path DFS is fine until the path count explodes; dynamic programming over a DAG prevents exponential blowups without losing exactness.
- Reachability pruning (forward from the start, backward from the end) slashes the state space before any heavy computation.
- Tracking requirement bits as a 2-bit mask keeps the Part 2 constraint lightweight and composable.
- When outputs grow huge, reach for `BigInt` sooner rather than later—especially in counting problems.
- Even AI needs a good graph model; once the structure was reframed as a topological DP, everything finally clicked.
