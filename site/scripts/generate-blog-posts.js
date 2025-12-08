const fs = require("fs");
const path = require("path");

const YEAR = "2025";
const BASE = `./${YEAR}`;
const OUT = `./site/src/aoc/${YEAR}`;

fs.mkdirSync(OUT, { recursive: true });

const days = fs.readdirSync(BASE).filter(f => /^\d+$/.test(f));

for (const day of days) {
    const src = path.join(BASE, day);
    const dest = path.join(OUT, `day${day.padStart(2, "0")}`);
    fs.mkdirSync(dest, { recursive: true });

    const blog = read(src, "Blog.md");
    const p1   = read(src, "part1.js") || read(src, "Part1.php");
    const p2   = read(src, "part2.js") || read(src, "Part2.php");

    const md = `---
title: "Advent of Code ${YEAR} – Day ${day}"
date: ${YEAR}-12-${day}
tags: [aoc, advent-of-code, ${YEAR}]
---

${blog}

## Solutions

<details>
<summary><strong>▶ Part 1 Code</strong></summary>

\`\`\`${p1.endsWith(".php") ? "php" : "js"}
${p1}
\`\`\`

</details>

<details>
<summary><strong>▶ Part 2 Code</strong></summary>

\`\`\`${p2.endsWith(".php") ? "php" : "js"}
${p2}
\`\`\`

</details>
`;

    fs.writeFileSync(path.join(dest, "index.md"), md);
    console.log("Generated AOC post for day", day);
}

function read(dir, file) {
    const p = path.join(dir, file);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}
