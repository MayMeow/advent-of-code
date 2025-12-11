# Advent of code 2025 `Advent.js`

| Day | Location               | Stars | Notes |
|-----|-------------------------|-------|-----------|
| 1   | Secret Entrance         | ⭐⭐ |           |
| 2   | Gift Shop               | ⭐⭐ |           |
| 3   | Lobby                   | ⭐⭐ |           |
| 4   | Printing Department     | ⭐⭐ |           |
| 5   | Cafeteria               | ⭐⭐ |           |
| 6   | Trash Compactor         | ⭐⭐ |           |
| 7   | Laboratories            | ⭐⭐ |           |
| 8   | Playground              | ⭐⭐ | p1: `533.42ms` p2: `276,96ms` |
| 9   | Movie Theater           | ⭐⭐ | p1: `56.27ms` p2: `117.81ms` |
| 10  | Factory                 | ⭐⭐ | p1: `70.12ms` p2: `541.27ms` |
| 11  | [Reactor](./11/)        | ⭐⭐ | p1: `53.48ms` p2: `54.94ms` (first tries took over 50 seconds and failed 🫤) |
| 12  |                         |       |           |

## Measure

```pwsh
Measure-Command { node {part1|part2}.js } | Select-Object TotalMilliseconds
```

## Computer

- Intel core Ultra 7 265
- 32GB Ram
- SSD
- Node.js v23.9.0
- Windows 11
