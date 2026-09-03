#!/usr/bin/env bash
# Regenerate pgo/rsvelte.profdata, the profile the shipped compiler is built with.
#
# The profile is an LLVM *IR-level* profile, so one file serves every target
# triple; what it is tied to is the LLVM version, which is why it is generated
# with the toolchain the release workflows use rather than with whatever is on
# PATH. A profile that is stale relative to the source degrades silently and
# correctly — LLVM matches entries by function hash and ignores the ones that
# moved — so this only needs re-running when a large share of the compiler has
# been rewritten, not on every change.
#
# The training set is every workload the flag is later applied to. That is not
# tidiness: `-Cprofile-use` treats a function with no counters as never
# executed, so applying a profile to code it never trained on makes that code
# *colder*, not merely un-improved. Adding a workload here and adding a build to
# the PGO list are one change.
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$REPO_ROOT"

OUT=pgo/rsvelte.profdata
RAW=${RAW_DIR:-$REPO_ROOT/target/pgo-raw}
# Held out from the evaluation slice: perf_bench selects
# `ids.skip(SKIP).step_by(len/limit).take(limit)`, so training at `--skip 0` and
# measuring at `--skip 1` share no file. Measured in-sample the same profile
# reads 1.179x where held out it reads 1.130x.
LIMIT=${PGO_LIMIT:-1700}

HOST=$(rustc -vV | awk '/^host: /{print $2}')
PROFDATA="$(rustc --print sysroot)/lib/rustlib/$HOST/bin/llvm-profdata"
[ -x "$PROFDATA" ] || { echo "no llvm-profdata at $PROFDATA (need the llvm-tools component)" >&2; exit 1; }

echo "==> instrumented build"
rm -rf "$RAW"; mkdir -p "$RAW"
CARGO_INCREMENTAL=0 CARGO_TARGET_DIR="$REPO_ROOT/target-pgo" \
  RUSTFLAGS="-Cprofile-generate=$RAW" \
  cargo build --release -p rsvelte_devtools --bin perf_bench --bin benchmark_runner

echo "==> training: the four compile surfaces"
for t in client server client-dev server-dev; do
  ./target-pgo/release/perf_bench --target "$t" --limit "$LIMIT" --runs 1 2>/dev/null | tail -1
done

echo "==> training: parse and svelte2tsx, which the compile surfaces do not reach"
FILES=$(mktemp)
trap 'rm -f "$FILES"' EXIT
node -e '
const m = require("./compatibility/manifest.json").filter((e) => e.kind === "component");
const limit = Number(process.argv[1]);
const stride = Math.max(1, Math.floor(m.length / limit));
const out = [];
for (let i = 0; i < m.length && out.length < limit; i += stride) {
  out.push("compatibility/sources/" + m[i].id);
}
require("fs").writeFileSync(process.argv[2], out.join("\n"));
' "$LIMIT" "$FILES"
for task in parse svelte2tsx; do
  ./target-pgo/release/benchmark_runner --mode single --task "$task" \
    --files "$FILES" --iterations 1 --warmup 0 >/dev/null
  echo "  trained $task"
done

echo "==> merge"
"$PROFDATA" merge --sparse -o "$OUT" "$RAW"
ls -l "$OUT"
echo "regenerated $OUT — commit it, then re-measure: a regenerated profile is a new arm."
