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
