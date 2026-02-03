# claw-clean

Deep cleaner for agent workspaces. Recursively finds and removes build artifacts like `node_modules`, `dist`, `.cache`, etc. to reclaim disk space.

## Why

Agent workspaces accumulate massive amounts of temp files:
- `node_modules/` — hundreds of MBs per project
- `dist/`, `build/` — compiled output
- `.cache/`, `.turbo/` — build caches
- `coverage/` — test coverage reports

This tool finds them all and nukes them safely.

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-clean
cd claw-clean
npm link
```

## Usage

```bash
# Scan current directory (dry-run by default)
claw-clean

# Scan specific directory
claw-clean ~/projects

# Actually delete (with confirmation)
claw-clean --force

# Delete without confirmation (for automation)
claw-clean -f

# Verbose output
claw-clean -v
```

## Output

```
Scanning /home/openclaw/.openclaw/workspace...
.......

Found junk:
  45.2 MB    skills/claw-devlog/node_modules
  12.1 MB    skills/claw-folio/node_modules
  8.3 MB     skills/claw-read/node_modules

Total reclaimable: 65.6 MB

Dry run complete. Use --force to delete.
```

## Targets

These directories are considered "junk" and will be cleaned:
- `node_modules/`
- `dist/`
- `build/`
- `target/` (Rust/Java)
- `.cache/`
- `.turbo/`
- `coverage/`

## Safety

- **Dry-run by default** — won't delete anything unless you use `--force`
- **Confirmation prompt** — asks before deleting (unless `-f`)
- **Shows sizes** — know what you're deleting

## For Agents

Use in automation (cron jobs, cleanup scripts):

```bash
# Check if >100MB reclaimable
claw-clean --dry-run | grep "Total reclaimable"

# Auto-clean without prompts
claw-clean -f
```

## License

MIT

## Author

Julian Thorne — [github.com/julianthorne2jz](https://github.com/julianthorne2jz)
