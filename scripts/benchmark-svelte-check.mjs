#!/usr/bin/env node
/**
 * Benchmark the rsvelte `svelte-check` CLI against the JS reference.
 *
 * Builds a synthetic workspace of N `.svelte` files, then runs:
 *   1. `target/release/svelte_check --workspace <fixture>`
 *   2. `npx svelte-check --workspace <fixture>` (if `--js` is passed
 *      and `npx` resolves the package)
 *
 * Prints a wall-clock comparison and exits non-zero only on hard
 * errors (the CLI under test is expected to exit 0/1 depending on
 * diagnostics, that's not a bench failure).
 *
 * Usage:
 *   node scripts/benchmark-svelte-check.mjs [--files=N] [--runs=K] [--js]
 *
 * Defaults: 1000 files, 3 runs each, no JS comparison.
 */

import { spawnSync } from 'child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const RSVELTE_BIN = join(REPO_ROOT, 'target', 'release', 'svelte_check');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
    const hit = args.find((a) => a.startsWith(`--${name}=`));
    return hit ? Number(hit.slice(name.length + 3)) : fallback;
};
const FILES = flag('files', 1000);
const RUNS = flag('runs', 3);
const COMPARE_JS = args.includes('--js');

function buildSyntheticSvelte(seed) {
    return `<script>
    let count = $state(${seed});
    function increment() { count++; }
</script>

<button onclick={increment}>Click {count}</button>
{#if count > 0}
    <p>Positive: {count}</p>
{:else}
    <p>Zero or negative</p>
{/if}
`;
}

function makeFixture(n) {
    const dir = mkdtempSync(join(tmpdir(), `rsvelte-bench-`));
    for (let i = 0; i < n; i++) {
        const sub = `pkg${(i / 50) | 0}`;
        const subdir = join(dir, 'src', sub);
        mkdirSync(subdir, { recursive: true });
        writeFileSync(join(subdir, `Comp${i}.svelte`), buildSyntheticSvelte(i));
    }
    writeFileSync(
        join(dir, 'tsconfig.json'),
        JSON.stringify(
            {
                compilerOptions: {
                    target: 'ESNext',
                    moduleResolution: 'node',
                    strict: true,
                    skipLibCheck: true
                },
                include: ['./**/*']
            },
            null,
            2
        )
    );
    return dir;
}

function timeMs(label, runner, { warmup = 0 } = {}) {
    for (let i = 0; i < warmup; i++) runner();
    const samples = [];
    for (let i = 0; i < RUNS; i++) {
        const t0 = performance.now();
        runner();
        samples.push(performance.now() - t0);
    }
    samples.sort((a, b) => a - b);
    const median = samples[Math.floor(samples.length / 2)];
    const best = samples[0];
    const worst = samples[samples.length - 1];
    console.log(
        `  ${label.padEnd(40)} median=${median.toFixed(1).padStart(8)}ms  best=${best.toFixed(1)}ms  worst=${worst.toFixed(1)}ms`
    );
    return { median, best, worst };
}

function ensureRsvelteBuilt() {
    const stat = spawnSync('test', ['-x', RSVELTE_BIN]);
    if (stat.status !== 0) {
        console.log('Building rsvelte svelte_check binary...');
        const r = spawnSync('cargo', ['build', '--release', '--bin', 'svelte_check'], {
            cwd: REPO_ROOT,
            stdio: 'inherit'
        });
        if (r.status !== 0) {
            console.error('cargo build failed');
            process.exit(2);
        }
    }
}

ensureRsvelteBuilt();

console.log(
    `=== svelte-check benchmark — ${FILES} synthetic .svelte files, ${RUNS} runs each ===\n`
);
const fixture = makeFixture(FILES);
console.log(`fixture: ${fixture}\n`);

try {
    console.log('rsvelte (Rust):');
    timeMs('cold (no overlay, parse only)', () => {
        spawnSync(RSVELTE_BIN, ['--workspace', fixture, '--output', 'machine'], {
            stdio: 'ignore'
        });
    });
    timeMs('with --emit-overlay', () => {
        spawnSync(RSVELTE_BIN, ['--workspace', fixture, '--emit-overlay', '--output', 'machine'], {
            stdio: 'ignore'
        });
    });
    timeMs(
        'warm --emit-overlay --incremental',
        () => {
            spawnSync(
                RSVELTE_BIN,
                [
                    '--workspace',
                    fixture,
                    '--emit-overlay',
                    '--incremental',
                    '--output',
                    'machine'
                ],
                { stdio: 'ignore' }
            );
        },
        // First warm pass populates the manifest. Subsequent invocations
        // hit the cache; bench from the second invocation onwards.
        { warmup: 1 }
    );

    if (COMPARE_JS) {
        console.log('\nJS svelte-check (npx):');
        timeMs('npx svelte-check', () => {
            spawnSync(
                'npx',
                ['--yes', 'svelte-check', '--workspace', fixture, '--output', 'machine'],
                { stdio: 'ignore' }
            );
        });
    } else {
        console.log('\n(skipped JS comparison — pass --js to enable)');
    }
} finally {
    rmSync(fixture, { recursive: true, force: true });
}
