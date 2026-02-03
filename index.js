#!/usr/bin/env node
// claw-clean - Deep cleaner for agent workspaces

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const args = process.argv.slice(2);
const TARGETS = ['node_modules', 'dist', 'build', 'target', '.cache', 'coverage', '.turbo'];

// Parse flags
const flags = {
    dryRun: true,
    force: false,
    dir: process.cwd(),
    verbose: false
};

const positional = [];

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--force' || arg === '-f') {
        flags.force = true;
        flags.dryRun = false;
    } else if (arg === '--dry-run' || arg === '-n') {
        flags.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
        flags.verbose = true;
    } else if (arg.startsWith('-')) {
        console.log(`Unknown flag: ${arg}`);
    } else {
        positional.push(arg);
    }
}

if (positional[0]) {
    flags.dir = path.resolve(positional[0]);
}

if (args.includes('help')) {
    console.log(`claw-clean - Workspace Cleaner

Usage:
  claw-clean [directory] [options]

Options:
  -f, --force      Delete files without confirmation (implies no dry-run)
  -n, --dry-run    Show what would be deleted (default)
  -v, --verbose    Show detailed output
  help             Show this help

Targets: ${TARGETS.join(', ')}
`);
    process.exit(0);
}

function getSize(itemPath) {
    try {
        // du -sh is faster/easier on linux than recursive fs.stat
        const output = execSync(`du -sk "${itemPath}" 2>/dev/null`, { encoding: 'utf8' });
        const kbytes = parseInt(output.split(/\s+/)[0], 10);
        return kbytes * 1024; // bytes
    } catch (e) {
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function scan(dir, list = []) {
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            let stats;
            try {
                stats = fs.lstatSync(fullPath);
            } catch (e) { continue; }

            if (stats.isDirectory()) {
                if (TARGETS.includes(item)) {
                    process.stdout.write('.');
                    list.push({ path: fullPath, size: getSize(fullPath) });
                } else if (!item.startsWith('.')) { // Skip hidden folders unless target
                    scan(fullPath, list);
                }
            }
        }
    } catch (e) {
        if (flags.verbose) console.error(`Error scanning ${dir}: ${e.message}`);
    }
    return list;
}

async function confirm(msg) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(`${msg} (y/N) `, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

async function main() {
    console.log(`Scanning ${flags.dir}...`);
    const found = scan(flags.dir);
    console.log('\n');

    if (found.length === 0) {
        console.log('✨ Clean! No junk found.');
        return;
    }

    const totalSize = found.reduce((acc, item) => acc + item.size, 0);

    console.log('Found junk:');
    found.forEach(item => {
        console.log(`  ${formatBytes(item.size).padEnd(10)} ${path.relative(flags.dir, item.path)}`);
    });
    console.log(`\nTotal reclaimable: ${formatBytes(totalSize)}`);

    if (flags.dryRun) {
        console.log('\nDry run complete. Use --force to delete.');
        return;
    }

    if (!flags.force) {
        const yes = await confirm('Delete these folders?');
        if (!yes) {
            console.log('Aborted.');
            return;
        }
    }

    console.log('\nDeleting...');
    found.forEach(item => {
        try {
            fs.rmSync(item.path, { recursive: true, force: true });
            console.log(`🗑️  Deleted ${path.basename(item.path)}`);
        } catch (e) {
            console.error(`❌ Failed to delete ${item.path}: ${e.message}`);
        }
    });

    console.log(`\n✨ Done! Reclaimed ${formatBytes(totalSize)}.`);
}

main();
