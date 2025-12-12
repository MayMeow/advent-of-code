# 🎄 Advent of code 2025 `Advent.js`

| Day | Location               | Stars | Notes |
|-----|-------------------------|-------|-----------|
| 1   | Secret Entrance         | ⭐⭐ | p1: `58.33ms` p2: `57.37ms` |
| 2   | Gift Shop               | ⭐⭐ | p1: `54.84ms` p2: `54.38ms` |
| 3   | Lobby                   | ⭐⭐ | p1: `59.80ms` p2: `56.53ms` |
| 4   | Printing Department     | ⭐⭐ | p1: `60.41ms` p2: `67.38ms` |
| 5   | Cafeteria               | ⭐⭐ | p1: `58.75ms` p2: `57.13ms` |
| 6   | Trash Compactor         | ⭐⭐ | p1: `55.55ms` p2: `384.99ms` |
| 7   | Laboratories            | ⭐⭐ | p1: `57.55ms` p2: `55.91ms` |
| 8   | Playground              | ⭐⭐ | p1: `533.42ms` p2: `276,96ms` |
| 9   | Movie Theater           | ⭐⭐ | p1: `56.27ms` p2: `117.81ms` |
| 10  | [Factory](./10/)        | ⭐⭐ | p1: `70.12ms` p2: `541.27ms` |
| 11  | [Reactor](./11/)        | ⭐⭐ | p1: `53.48ms` p2: `54.94ms` (first tries took over 50 seconds and failed 🫤) |
| 12  | Christmas Tree Farm     | ⭐⭐ | p1v1: `17421ms` p1v2: `4857ms` p1v3: `14973ms` |

## Measure

```pwsh
# change part 1 or part 2 for test
Measure-Command { node [part1|part2].js } | Select-Object TotalMilliseconds
```

## Computer

- Intel core Ultra 7 265
- 32GB Ram
- SSD
- Node.js v23.9.0
- Windows 11
