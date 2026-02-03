---
name: claw-clean
description: Deep cleaner for agent workspaces. Recursively finds and removes node_modules, dist, .cache, and other build artifacts to reclaim disk space.
homepage: https://github.com/julianthorne2jz/claw-clean
---

# claw-clean

Clean build artifacts from workspaces.

## Quick Start

```bash
# Scan (dry-run)
claw-clean

# Delete with confirmation
claw-clean --force

# Delete without prompts (automation)
claw-clean -f
```

## What it cleans

- `node_modules/`
- `dist/`, `build/`
- `.cache/`, `.turbo/`
- `coverage/`
- `target/` (Rust/Java)

## Flags

- `--force, -f` — Delete (with confirmation unless combined)
- `--dry-run, -n` — Show what would be deleted (default)
- `--verbose, -v` — Detailed output

## Automation

```bash
# Check reclaimable space
claw-clean | grep "Total reclaimable"

# Auto-clean in cron
claw-clean -f
```
