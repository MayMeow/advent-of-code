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
