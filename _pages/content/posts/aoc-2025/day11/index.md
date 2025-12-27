---
title: "Advent of Code 2025 – Day 11"
date: 2025-12-11
tags: [aoc, advent-of-code, 2025]
---

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


## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const raw = fs.readFileSync(inputPath, 'utf8').trim();
const lines = raw.split(/\r?\n/).filter(Boolean);

function parseGraph(lines) {
  const graph = new Map();
  for (const line of lines) {
    const [source, targets] = line.split(':').map(s => s.trim());
    const targetList = targets.split(/\s+/).filter(Boolean);
    graph.set(source, targetList);
  }
  return graph;
}

function countPaths(graph, start, end) {
  let count = 0;
  
  function dfs(node, visited) {
    if (node === end) {
      count += 1;
      return;
    }
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        dfs(neighbor, visited);
        visited.delete(neighbor);
      }
    }
  }
  
  const visited = new Set([start]);
  dfs(start, visited);
  return count;
}

const graph = parseGraph(lines);
const pathCount = countPaths(graph, 'you', 'out');
console.log(String(pathCount));

```

</details>

<details>
<summary><strong>▶ Part 2 Code</strong></summary>

```js
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] ?? path.join(__dirname, 'input.txt');
const raw = fs.readFileSync(inputPath, 'utf8').trim();
const lines = raw.split(/\r?\n/).filter(Boolean);

function buildGraphs(lines) {
  const graph = new Map();
  const reverse = new Map();

  for (const line of lines) {
    const [srcPart, tgtPart = ''] = line.split(':');
    if (!srcPart) continue;
    const source = srcPart.trim();
    const targets = tgtPart.trim() ? tgtPart.trim().split(/\s+/).filter(Boolean) : [];

    graph.set(source, targets);
    if (!reverse.has(source)) reverse.set(source, []);

    for (const target of targets) {
      if (!graph.has(target)) graph.set(target, []);
      if (!reverse.has(target)) reverse.set(target, []);
      reverse.get(target).push(source);
    }
  }

  for (const node of graph.keys()) {
    if (!reverse.has(node)) reverse.set(node, []);
  }

  return { graph, reverse };
}

function collectReachable(adj, start) {
  const reachable = new Set();
  if (!adj.has(start)) return reachable;

  const queue = [start];
  reachable.add(start);

  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!reachable.has(neighbor)) {
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return reachable;
}

function topologicalOrder(graph, subset) {
  const indegree = new Map();
  for (const node of subset) {
    indegree.set(node, 0);
  }

  for (const node of subset) {
    for (const neighbor of graph.get(node) || []) {
      if (subset.has(neighbor)) {
        indegree.set(neighbor, indegree.get(neighbor) + 1);
      }
    }
  }

  const queue = [];
  for (const [node, deg] of indegree.entries()) {
    if (deg === 0) queue.push(node);
  }

  const order = [];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    order.push(node);
    for (const neighbor of graph.get(node) || []) {
      if (!subset.has(neighbor)) continue;
      indegree.set(neighbor, indegree.get(neighbor) - 1);
      if (indegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  return order;
}

function requirementMask(node, req1, req2) {
  let mask = 0;
  if (node === req1) mask |= 1;
  if (node === req2) mask |= 2;
  return mask;
}

function dfsFallback(graph, start, end, req1, req2) {
  let total = 0n;

  function dfs(node, visited, hasReq1, hasReq2) {
    if (node === end) {
      if (hasReq1 && hasReq2) total += 1n;
      return;
    }

    for (const next of graph.get(node) || []) {
      if (visited.has(next)) continue;
      visited.add(next);
      dfs(next, visited, hasReq1 || next === req1, hasReq2 || next === req2);
      visited.delete(next);
    }
  }

  const visited = new Set([start]);
  dfs(start, visited, start === req1, start === req2);
  return total;
}

function countPathsWithRequired(graph, reverse, start, end, required) {
  const [req1, req2] = required;

  for (const node of [start, end, req1, req2]) {
    if (!graph.has(node)) graph.set(node, []);
    if (!reverse.has(node)) reverse.set(node, []);
  }

  const forwardReach = collectReachable(graph, start);
  if (!forwardReach.has(end)) return 0n;

  const backwardReach = collectReachable(reverse, end);
  const usableNodes = new Set();
  for (const node of forwardReach) {
    if (backwardReach.has(node)) {
      usableNodes.add(node);
    }
  }

  if (!usableNodes.has(req1) || !usableNodes.has(req2)) {
    return 0n;
  }

  const topo = topologicalOrder(graph, usableNodes);
  if (topo.length !== usableNodes.size) {
    return dfsFallback(graph, start, end, req1, req2);
  }

  const state = new Map();
  for (const node of usableNodes) {
    state.set(node, [0n, 0n, 0n, 0n]);
  }

  const startMask = requirementMask(start, req1, req2);
  state.get(start)[startMask] = 1n;

  for (const node of topo) {
    const counts = state.get(node);
    if (!counts) continue;
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!usableNodes.has(neighbor)) continue;
      const neighborCounts = state.get(neighbor);
      const neighborMask = requirementMask(neighbor, req1, req2);
      for (let mask = 0; mask < 4; mask++) {
        const ways = counts[mask];
        if (ways === 0n) continue;
        const nextMask = mask | neighborMask;
        neighborCounts[nextMask] = neighborCounts[nextMask] + ways;
      }
    }
  }

  return state.get(end)[3];
}

const { graph, reverse } = buildGraphs(lines);
const pathCount = countPathsWithRequired(graph, reverse, 'svr', 'out', ['dac', 'fft']);
console.log(pathCount.toString());

```

</details>
