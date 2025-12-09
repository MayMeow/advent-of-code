# 🎄 Advent of Code Solutions

My solutions to [Advent of Code](https://adventofcode.com/) puzzles across multiple years. Each year's puzzles are solved using different programming languages and approaches.

## 📁 Repository Structure

Solutions are organized by year and day:

```
2023/
├── Day08/    # PHP solutions for Day 8
├── Day09/    # PHP solutions for Day 9
└── Day10/    # PHP solutions for Day 10

2024/
├── 01/       # PHP solutions for Day 1
└── 24/       # PHP solutions for Day 24

2025/
├── 01/       # JavaScript solutions for Day 1
├── 02/       # JavaScript solutions for Day 2
├── ...
└── 09/       # JavaScript solutions for Day 9
```

Each day's folder typically contains:
- `Readme.md` - The puzzle description
- `input.txt` - Your personal puzzle input
- `sample.txt` - Sample input from the puzzle (2025 onwards)
- `Part1.php` / `part1.js` - Solution for part 1
- `Part2.php` / `part2.js` - Solution for part 2
- `Blog.md` - Write-up explaining the approach (select days)

## 🌟 Progress

### 2025 (JavaScript)
| Day | Location             | Stars | Blog |
|-----|----------------------|-------|------|
| 1   | Secret Entrance      | ⭐⭐  |      |
| 2   | Gift Shop            | ⭐⭐  |      |
| 3   | Lobby                | ⭐⭐  |      |
| 4   | Printing Department  | ⭐⭐  |      |
| 5   | Cafeteria            | ⭐⭐  |      |
| 6   | Trash Compactor      | ⭐⭐  |      |
| 7   | Laboratories         | ⭐⭐  |      |
| 8   | Playground           | ⭐⭐  | ✓    |
| 9   | Movie Theater        | ⭐⭐  |      |

### 2024 (PHP)
| Day | Stars |
|-----|-------|
| 1   | ⭐⭐  |
| 24  | ⭐⭐  |

### 2023 (PHP)
| Day | Stars |
|-----|-------|
| 8   | ⭐⭐  |
| 9   | ⭐⭐  |
| 10  | ⭐⭐  |

## 🚀 Running the Solutions

### JavaScript Solutions (2025)

**Prerequisites:**
- Node.js (version 14 or higher)

**Running a solution:**
```bash
# Navigate to the specific day
cd 2025/01

# Run with the default input.txt
node part1.js

# Or specify a custom input file
node part1.js sample.txt
```

**Using npm scripts (if available):**
```bash
# Example: Run day 1 part 1
npm run 2025-day-01-part-1

# Note: Additional scripts can be added to package.json as needed
```

### PHP Solutions (2023-2024)

**Prerequisites:**
- PHP 8.0 or higher
- Composer

**Setup:**
```bash
composer install
```

**Running a solution:**
```bash
# Navigate to the specific day
cd 2024/01

# Run the solution
php Part1.php
php Part2.php
```

## 🛠️ Development

### Installation

```bash
# Clone the repository
git clone https://github.com/MayMeow/advent-of-code.git
cd advent-of-code

# Install PHP dependencies
composer install

# Install Node.js dependencies (for 2025 solutions)
npm install
```

### Testing

```bash
# Run PHP tests
composer test

# Or directly with PHPUnit
./vendor/bin/phpunit tests
```

### Project Structure

- `src/` - Reusable PHP classes and utilities
- `tests/` - PHP unit tests
- `site/` - Blog post generation scripts
- `config/` - Configuration files
- `inputs/` - Shared input files

## 📝 Blog Posts

Selected days include detailed write-ups explaining the approach, complexity analysis, and key takeaways. Blog posts follow a consistent structure:

1. **Problem Summary** - Brief description of the puzzle
2. **Approach** - Step-by-step solution explanation
3. **Complexity Analysis** - Time and space complexity
4. **Takeaways** - Key insights and learnings

Blog posts are written in `Blog.md` files within each day's folder.

## 🎯 Coding Conventions

### JavaScript (2025)
- Simple, self-contained scripts
- Read input from `process.argv[2]` or default to `input.txt`
- Synchronous file reading with `fs.readFileSync`
- Print answers as strings to console
- Use `BigInt` for large number calculations
- 2-space indentation

### PHP (2023-2024)
- Procedural scripts for straightforward problems
- PSR-4 autoloading for reusable components
- Read input from local `input.txt` file
- Stay within ASCII unless file uses Unicode

## 📜 License

ISC License

## 👤 Author

**May Meow**
- GitHub: [@MayMeow](https://github.com/MayMeow)
- Email: may@maymeow.com

## 🔗 Links

- [Advent of Code](https://adventofcode.com/)
- [Repository](https://github.com/MayMeow/advent-of-code)
- [Issues](https://github.com/MayMeow/advent-of-code/issues)

---

Happy coding! 🎄✨
