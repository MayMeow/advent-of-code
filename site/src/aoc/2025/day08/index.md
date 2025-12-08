---
title: "Advent of Code 2025 – Day 08"
date: 2025-12-08
tags: [aoc, advent-of-code, 2025]
---

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


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const CONNECTION_LIMIT = 1000;

function readPoints(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) {
        return [];
    }

    return raw.split(/\r?\n/).map((line) => line.split(',').map((value) => Number(value.trim())));
}

class DisjointSet {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, index) => index);
        this.rank = Array(size).fill(0);
        this.componentSize = Array(size).fill(1);
    }

    find(node) {
        if (this.parent[node] !== node) {
            this.parent[node] = this.find(this.parent[node]);
        }
        return this.parent[node];
    }

    union(a, b) {
        let rootA = this.find(a);
        let rootB = this.find(b);
        if (rootA === rootB) {
            return false;
        }

        if (this.rank[rootA] < this.rank[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.parent[rootB] = rootA;
        this.componentSize[rootA] += this.componentSize[rootB];

        if (this.rank[rootA] === this.rank[rootB]) {
            this.rank[rootA] += 1;
        }

        return true;
    }
}

function buildEdges(points) {
    const edges = [];
    for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
            const dx = points[i][0] - points[j][0];
            const dy = points[i][1] - points[j][1];
            const dz = points[i][2] - points[j][2];
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            edges.push({ distanceSquared, a: i, b: j });
        }
    }
    edges.sort((left, right) => left.distanceSquared - right.distanceSquared);
    return edges;
}

function productOfLargestThree(dsu) {
    const sizesByRoot = new Map();
    for (let i = 0; i < dsu.parent.length; i += 1) {
        const root = dsu.find(i);
        sizesByRoot.set(root, (sizesByRoot.get(root) ?? 0) + 1);
    }

    const sorted = Array.from(sizesByRoot.values()).sort((a, b) => b - a);
    while (sorted.length < 3) {
        sorted.push(1);
    }
    return sorted.slice(0, 3).reduce((product, size) => product * size, 1);
}

function main() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exitCode = 1;
        return;
    }

    const points = readPoints(inputPath);
    if (points.length === 0) {
        console.log('0');
        return;
    }

    const edges = buildEdges(points);
    const dsu = new DisjointSet(points.length);
    const pairsToConnect = Math.min(CONNECTION_LIMIT, edges.length);

    for (let i = 0; i < pairsToConnect; i += 1) {
        const { a, b } = edges[i];
        dsu.union(a, b);
    }

    const answer = productOfLargestThree(dsu);
    console.log(answer.toString());
}

main();

```

</details>

<details>
<summary><strong>▶ Part 2 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');

function readPoints(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').trim();
    if (!raw) {
        return [];
    }

    return raw.split(/\r?\n/).map((line) => line.split(',').map((value) => Number(value.trim())));
}

class DisjointSet {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, index) => index);
        this.rank = Array(size).fill(0);
        this.components = size;
    }

    find(node) {
        if (this.parent[node] !== node) {
            this.parent[node] = this.find(this.parent[node]);
        }
        return this.parent[node];
    }

    union(a, b) {
        let rootA = this.find(a);
        let rootB = this.find(b);
        if (rootA === rootB) {
            return false;
        }

        if (this.rank[rootA] < this.rank[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.parent[rootB] = rootA;
            if (this.rank[rootA] === this.rank[rootB]) {
            this.rank[rootA] += 1;
        }

        this.components -= 1;
        return true;
    }
}

function buildEdges(points) {
    const edges = [];
    for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
            const dx = points[i][0] - points[j][0];
            const dy = points[i][1] - points[j][1];
            const dz = points[i][2] - points[j][2];
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            edges.push({ distanceSquared, a: i, b: j });
        }
    }
    edges.sort((left, right) => left.distanceSquared - right.distanceSquared);
    return edges;
}

function productOfXCoordinates(points, indexA, indexB) {
    const xA = BigInt(points[indexA][0]);
    const xB = BigInt(points[indexB][0]);
    return xA * xB;
}

function main() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exitCode = 1;
        return;
    }

    const points = readPoints(inputPath);
    if (points.length <= 1) {
        console.log('0');
        return;
    }

    const edges = buildEdges(points);
    const dsu = new DisjointSet(points.length);
    let lastConnection = null;

    for (const edge of edges) {
        if (dsu.union(edge.a, edge.b)) {
            lastConnection = edge;
            if (dsu.components === 1) {
                break;
            }
        }
    }

    if (!lastConnection) {
        console.error('Unable to connect all junction boxes.');
        process.exitCode = 1;
        return;
    }

    const product = productOfXCoordinates(points, lastConnection.a, lastConnection.b);
    console.log(product.toString());
}

main();

```

</details>
