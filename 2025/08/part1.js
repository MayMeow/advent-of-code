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
