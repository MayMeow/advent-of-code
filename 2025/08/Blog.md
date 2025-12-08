# Advent of Code 2025 - Day 8: Playground

Day 8 was basically a geometric Kruskal party. Every junction box is a point in 3D space, and connecting two points merges their electrical circuits. Part 1 stops after the 1000 closest connections; Part 2 runs until everything is fused into one mega-circuit.

## Part 1 – Wiring the Closest Circuits
To figure out what the three largest circuits look like after 1000 tiny wires, I treated the boxes as a complete graph and let a Disjoint Set Union keep track of circuit sizes.

1. **Parse & Build Edges.** Read every `x,y,z` triple, build all pairwise edges, and store squared distances to avoid slow square roots.
2. **Sort the Edge List.** Sorting puts the shortest edges first, exactly what Kruskal’s algorithm needs.
3. **Union the First 1000.** Feed the first 1000 edges (or fewer if the graph is smaller) into the DSU. Every successful union merges two circuits and accumulates their sizes.
4. **Multiply the Top Three.** Collect every component size left inside the DSU, sort descending, and multiply the three largest counts for the answer.

**Complexity.** Building and sorting the \(n(n-1)/2\) edges costs \(O(n^2 \log n)\) time and \(O(n^2)\) memory. DSU operations are effectively constant per edge.

## Part 2 – Finding the Final Wire
Now the Elves wanted to know which single connection finally ties the whole playground together and how long that wire needs to be along the X axis.

1. **Reuse the Sorted Edges.** No new parsing tricks—just march through the same edge list again.
2. **Track Components.** I let the DSU expose a `components` counter. Each successful union decrements it.
3. **Stop at One Circuit.** As soon as `components` drops to `1`, the current edge is the decisive connection. I stash that pair of indices.
4. **BigInt Output.** Multiply the X coordinates of that pair using `BigInt` so even absurd coordinates stay accurate.

**Complexity.** Same \(O(n^2 \log n)\) time and \(O(n^2)\) space as Part 1, though we usually terminate well before exhausting every edge because a spanning tree only needs \(n-1\) successful unions.

## Takeaways
- Both parts piggyback on the same sorted edge list; changing the stopping condition gives two different answers almost for free.
- Tracking component sizes solved Part 1, while tracking the component count solved Part 2—two tiny tweaks to the DSU internals.
- `BigInt` support in Node makes it painless to return huge coordinate products without worrying about overflow.
