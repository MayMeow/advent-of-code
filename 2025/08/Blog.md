# Day 8: Playground

## Summary
The playground is packed with floating junction boxes in 3D space. Connecting two boxes lets electricity flow between their circuits. Part 1 asks for the product of the three largest circuit sizes after wiring the 1000 closest pairs. Part 2 keeps wiring until everything belongs to a single circuit and then multiplies the X coordinates of that final connection.

## Part 1 – Closest Circuits
I treated the junction boxes as nodes in a complete graph and leaned on a Kruskal-style pass:

1. **Parse & Edge List** – Read every `x,y,z` triple and build all \(n(n-1)/2\) edges, storing squared distances so I never compute square roots.
2. **Sort & Union** – Sort the edges ascending and feed them to a Disjoint Set Union (DSU). Every successful union merges two circuits and keeps cumulative sizes per root.
3. **Measure Result** – After exactly 1000 unions (or fewer if we run out of edges) I gathered every component size, sorted descending, and multiplied the top three counts.

### Code Snippet
```javascript
const edges = buildEdges(points); // all squared distances, sorted
const dsu = new DisjointSet(points.length);
for (let i = 0; i < Math.min(1000, edges.length); i += 1) {
	const { a, b } = edges[i];
	dsu.union(a, b);
}
const answer = productOfLargestThree(dsu);
```

### Complexity
* **Time:** \(O(n^2 \log n)\) for sorting the quadratic number of edges; DSU operations are almost constant.
* **Space:** \(O(n^2)\) to hold the edge list plus \(O(n)\) for DSU arrays.

## Part 2 – Last Connection
Part 2 reused the exact same data but I kept going until the DSU reported a single component. The only extra bookkeeping was tracking which edge performed the final merge.

1. **Same Edge Order** – Iterate the sorted edges, calling `union(a, b)`.
2. **Component Counter** – The DSU tracks how many components remain. When it hits one, the current edge is the “last connection”.
3. **BigInt Product** – Multiply the X coordinates of the two boxes from that edge with `BigInt` to avoid overflow.

### Code Snippet
```javascript
let lastEdge = null;
for (const edge of edges) {
	if (dsu.union(edge.a, edge.b)) {
		lastEdge = edge;
		if (dsu.components === 1) break;
	}
}
const product = BigInt(points[lastEdge.a][0]) * BigInt(points[lastEdge.b][0]);
```

### Complexity
Identical \(O(n^2 \log n)\) time and \(O(n^2)\) space as Part 1. In practice the loop terminates earlier than consuming every edge because a connected spanning structure forms after \(n-1\) successful unions.

## Takeaways
* Building the full edge list is expensive but predictable; the DSU lets me answer multiple questions with the same sorted edges.
* Part 1 required tracking component sizes, while Part 2 only cared about the order of merges—two complementary views of the same Kruskal pass.
* `BigInt` was essential once coordinate products could exceed 32-bit or 53-bit integer limits.
