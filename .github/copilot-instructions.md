# Copilot Instructions

## Repository Overview
- Advent of Code solutions organized by year/day (e.g., `2025/08`).
- PHP used for 2023–2024; JavaScript (Node.js) used for 2025.
- Each day folder contains `Readme.md`, `input.txt`, solver files, and (for 2025) `Blog.md` write-ups, `sample.txt` which you can read from `Readme.md` file.

## Coding Conventions
- **PHP**: simple procedural scripts, input read from local `input.txt`. Stay within ASCII unless file already uses Unicode.
- **JavaScript**: filenames `part1.js`, `part2.js`, etc. Scripts read `process.argv[2] ?? path.join(__dirname, 'input.txt')`, sync file reads (`fs.readFileSync`), and print answers as strings.
- Use succinct comments only where logic isn’t obvious. Favor 2-space indentation in JS.

## Workflow Expectations
- Read the day’s `Readme.md` before coding. Keep puzzle-specific files inside that day’s folder.
- Reuse helper patterns when possible (e.g., DSU implementations, parsing helpers).
- Blog posts should follow the narrative style of earlier days (summary, step-by-step approach, complexity, takeaways).
- When adding new files, prefer `create_file`; for edits, use `apply_patch` when practical.

## Guardrails
- Never revert or overwrite user changes unless explicitly asked.
- Don’t touch unrelated folders when solving a specific day’s puzzle.
- Avoid adding dependencies unless absolutely necessary; solutions should stay self-contained.
- Use `BigInt` in JS when results might exceed 32-bit/53-bit precision.

## Testing & Execution
- PHP: run from the day folder (`php Part1.php`).
- Node.js: run from the day folder (`node part1.js [optional-input]`).
- No central test runner; each puzzle is standalone.

## Documentation
- Blog entries live under each day (`2025/08/Blog.md`). Match existing tone: friendly narrative, numbered/bulleted steps, explicit complexity section.
- If you add a new day, mirror this structure (solver + input + sample - if missing).
- You write blog posts only when asked; otherwise, focus on code correctness and clarity.
