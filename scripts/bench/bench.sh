#!/usr/bin/env bash
# Performance benchmark script for rsvelte compiler.
#
# Usage:
#   ./scripts/bench/bench.sh              # Run full JS vs Rust comparison
#   ./scripts/bench/bench.sh --criterion  # Run Criterion micro-benchmarks
#   ./scripts/bench/bench.sh --profile    # Run profiler on a single large file
#   ./scripts/bench/bench.sh --quick      # Quick single-threaded-only comparison
#
# Prerequisites:
#   - Rust toolchain installed
#   - npm dependencies installed (npm install)
#   - Fixtures generated (npm run generate-fixtures)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() { echo -e "${CYAN}[bench]${NC} $*"; }
warn() { echo -e "${YELLOW}[bench]${NC} $*"; }
ok() { echo -e "${GREEN}[bench]${NC} $*"; }
err() { echo -e "${RED}[bench]${NC} $*" >&2; }

build_release() {
    log "Building release binary..."
    cargo build --release --bin benchmark_runner 2>&1 | tail -1
    ok "Release build complete."
}

run_full_benchmark() {
    log "Running full JS vs Rust benchmark..."
    build_release

    local output_file="$PROJECT_DIR/benchmark-results.json"
    node "$SCRIPT_DIR/run-benchmark.mjs" > "$output_file"

    ok "Results saved to benchmark-results.json"
    echo ""

    node -e "
const r = require('$output_file');
const fmt = (v) => v.toFixed(1);
const fmtMs = (v) => v.toFixed(0) + 'ms';

console.log('=== Benchmark Results (' + r.testFilesCount + ' files) ===');
console.log('');

// compile-client lives at the top level of the JSON for backwards
// compat; every other task is a nested sibling keyed by name.
const tasks = [
    ['Compile (Client)', r],
    ['Parse', r.parse],
    ['svelte2tsx', r.svelte2tsx],
    ['fmt', r.fmt],
    ['svelte-check', r.svelteCheck],
];
for (const [label, d] of tasks) {
    if (!d || !d.javascript) continue;
    console.log(label + ':');
    console.log('  JavaScript:           ' + fmtMs(d.javascript.durationMs));
    console.log('  Rust (single-thread): ' + fmtMs(d.rustSingleThread.durationMs) + '  (' + fmt(d.speedup.singleThreadVsJs) + 'x)');
    console.log('  Rust (multi-thread):  ' + fmtMs(d.rustMultiThread.durationMs) + '  (' + fmt(d.speedup.multiThreadVsJs) + 'x)');
    console.log('');
}
"
}

run_criterion() {
    log "Running Criterion benchmarks..."
    cargo bench --bench compiler 2>&1
    cargo bench --bench parser 2>&1
    cargo bench -p rsvelte_formatter --bench formatter 2>&1
    ok "Criterion benchmarks complete. See target/criterion/ for HTML reports."
}

run_profile() {
    local file="${1:-}"
    log "Building profiler..."
    cargo build --release --bin profiler 2>&1 | tail -1

    if [ -n "$file" ]; then
        log "Profiling: $file"
        "$PROJECT_DIR/target/release/profiler" --file "$file" --iterations 20 --warmup 5
    else
        local test_file
        test_file=$(find "$PROJECT_DIR/svelte/packages/svelte/tests/runtime-runes/samples" \
            -name "input.svelte" -exec wc -c {} + 2>/dev/null | sort -rn | head -2 | tail -1 | awk '{print $2}')

        if [ -n "$test_file" ] && [ -f "$test_file" ]; then
            log "Profiling largest test file: $test_file"
            "$PROJECT_DIR/target/release/profiler" --file "$test_file" --iterations 20 --warmup 5
        else
            warn "No test file found. Creating synthetic file..."
            local tmp_file
            tmp_file=$(mktemp /tmp/bench-XXXXXX.svelte)
            python3 -c "
print('<script>')
print('  let count = \$state(0);')
print('  let doubled = \$derived(count * 2);')
print('  function increment() { count++; }')
print('</script>')
for i in range(200):
    print(f'<div class=\"item-{i}\">')
    print(f'  <span>Item {i}: {{count}}</span>')
    print(f'  {{#if count > {i}}}')
    print(f'    <strong>Active {i}</strong>')
    print(f'  {{:else}}')
    print(f'    <em>Inactive</em>')
    print(f'  {{/if}}')
    print(f'</div>')
" > "$tmp_file"
            log "Profiling synthetic file ($tmp_file)"
            "$PROJECT_DIR/target/release/profiler" --file "$tmp_file" --iterations 20 --warmup 5
            rm -f "$tmp_file"
        fi
    fi
}

run_quick() {
    log "Running quick single-threaded benchmark..."
    build_release

    local output_file="$PROJECT_DIR/benchmark-results.json"
    node "$SCRIPT_DIR/run-benchmark.mjs" > "$output_file"

    # Print only single-threaded results
    node -e "
const r = require('$output_file');
const fmt = (v) => v.toFixed(1);
const fmtMs = (v) => v.toFixed(0) + 'ms';

console.log('=== Single-Threaded Results (' + r.testFilesCount + ' files) ===');
console.log('');
console.log('Task               | JS       | Rust     | Speedup');
console.log('-------------------|----------|----------|--------');

const tasks = [
    ['Compile (Client)', r],
    ['Parse', r.parse],
    ['svelte2tsx', r.svelte2tsx],
    ['fmt', r.fmt],
    ['svelte-check', r.svelteCheck],
];
for (const [taskLabel, d] of tasks) {
    if (!d || !d.javascript) continue;
    const label = taskLabel.padEnd(18);
    const js = fmtMs(d.javascript.durationMs).padStart(8);
    const rs = fmtMs(d.rustSingleThread.durationMs).padStart(8);
    const sp = (fmt(d.speedup.singleThreadVsJs) + 'x').padStart(7);
    console.log(label + ' | ' + js + ' | ' + rs + ' | ' + sp);
}
console.log('');
console.log('Target: 100x single-threaded for all tasks.');
"
}

case "${1:-}" in
    --criterion)
        run_criterion
        ;;
    --profile)
        run_profile "${2:-}"
        ;;
    --quick)
        run_quick
        ;;
    --help|-h)
        echo "Usage: $0 [--criterion | --profile [file] | --quick | --help]"
        echo ""
        echo "  (no args)    Full JS vs Rust comparison benchmark"
        echo "  --criterion  Criterion micro-benchmarks (per-phase)"
        echo "  --profile    Profiler with per-phase breakdown"
        echo "  --quick      Quick single-threaded-only summary"
        echo "  --help       Show this help"
        ;;
    *)
        run_full_benchmark
        ;;
esac
