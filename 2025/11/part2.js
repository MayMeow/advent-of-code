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
