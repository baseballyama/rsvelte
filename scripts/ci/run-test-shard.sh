#!/usr/bin/env bash
#
# Build + run one CI `test` shard's slice of the suite.
#
# Why this exists
# ---------------
# `cargo nextest run` always *builds* every workspace test binary, regardless of
# which tests a `-E` filter selects to *run*. This workspace links ~159 separate
# integration-test binaries against the large `rsvelte_core` rlib, and a push
# that touches `rsvelte_core` recompiles all of them — so on a CI runner the
# build is ~95% of each shard's wall time (the test *run* itself is ~8 s).
# Count-partitioning (`--partition count:N/3`) splits the *run* evenly but every
# shard still builds all 159 binaries, so the build floor — the actual
# bottleneck — was paid three times over.
#
# Instead we partition the *binaries* across shards by cargo target selection:
# each shard compiles only its ~1/Nth of the integration-test targets, cutting
# the per-shard build floor roughly N-fold. The partition is derived from
# `cargo metadata`'s authoritative target list via a stable sort + modulo, so it
# is total by construction (no binary is silently dropped) and automatically
# absorbs newly added `tests/*.rs` files with no edits here.
#
# IMPORTANT: all of a shard's targets are selected in a SINGLE `cargo nextest
# run`. Splitting them across several `cargo` invocations (e.g. one per package)
# makes cargo re-resolve features per invocation and rebuild shared dependencies
# (the oxc graph) between them — feature thrashing that is dramatically *slower*
# than building everything once. Test-target names are unique across the
# workspace (checked: `… | sort | uniq -d` is empty), so a single invocation
# listing every `-p`/`--test` has no cross-crate `--test NAME` ambiguity.
#
# Coverage is identical to the previous count-partitioned job: every test that
# ran before still runs in exactly one shard, and the heavy fan-out suites keep
# running in their dedicated jobs (see the exclusion list / RUN_FILTER below).
#
# Portability: must run on the GitHub macOS runners' stock /bin/bash 3.2, so no
# `declare -A` / `mapfile` (bash 4+) and no `grep -P` (absent on BSD grep) — the
# partition is done in awk.
#
# Usage: run-test-shard.sh <shard 1-based> <total shards>
set -euo pipefail

SHARD="${1:?usage: run-test-shard.sh <shard 1-based> <total>}"
TOTAL="${2:?usage: run-test-shard.sh <shard 1-based> <total>}"

# Heavy `#[test]` functions that run in a dedicated job but live in a binary we
# still build here for its lighter siblings: the `runtime` binary's hydration /
# browser / listing tests run in the shards, while its two 1000+-fixture
# fan-outs run in "Test runtime". Excluding by name is a no-op on shards that
# don't build `runtime`, so the same filter is safe to pass to every shard.
RUN_FILTER='not (test(/test_runtime_legacy/) | test(/test_runtime_runes/) | test(/compile_module_is_thread_safe_under_reuse/))'

# "<pkg>\t<name>" for every integration-test target, minus the binaries that are
# built+run wholesale in their own dedicated jobs (and have no lighter siblings
# we need here): compile_module_thread_safety -> "Test thread-safety";
# svelte_dev_corpus / svelte_dev_markdown -> "Test fmt corpus". Stably sorted so
# the modulo partition is deterministic across shards.
ALL_TARGETS="$(
  cargo metadata --no-deps --format-version 1 \
    | jq -r '.packages[] as $p | $p.targets[] | select(.kind | index("test")) | "\($p.name)\t\(.name)"' \
    | awk -F'\t' '$2 != "compile_module_thread_safety" && $2 != "svelte_dev_corpus" && $2 != "svelte_dev_markdown"' \
    | sort
)"

if [ -z "$ALL_TARGETS" ]; then
  echo "::error::no integration-test targets found via cargo metadata" >&2
  exit 1
fi

# This shard's targets: 0-based stable index, modulo partition.
MINE="$(printf '%s\n' "$ALL_TARGETS" | awk -v s="$SHARD" -v t="$TOTAL" '(NR-1) % t == s-1')"

# Assemble a single cargo nextest invocation. `--test <name>` selects integration
# targets; the `-p` set scopes them. Names are workspace-unique, so listing every
# package the shard touches is unambiguous.
#
# Only integration-test *binaries* are partitioned here. The `--lib` / `--bins`
# `#[cfg(test)]` unit tests run in their own `test-unit` job — folding them onto
# one shard made that shard link its ~52 integration binaries *plus* every
# crate's unit-test binary at once, and the extra concurrent links exhausted the
# runner's memory (linker SIGBUS). Keeping the shards integration-only makes all
# three uniform (~52 binaries each, the load shards 2/3 already linked cleanly).
ARGS=""
for name in $(printf '%s\n' "$MINE" | cut -f2); do
  ARGS="$ARGS --test $name"
done
for pkg in $(printf '%s\n' "$MINE" | cut -f1 | sort -u); do
  ARGS="$ARGS -p $pkg"
done

echo "::group::Shard ${SHARD}/${TOTAL} selection"
printf '%s\n' "$MINE"
echo "cargo nextest run --profile ci$ARGS -E '$RUN_FILTER'"
echo "::endgroup::"

# shellcheck disable=SC2086 -- intentional word-splitting of the assembled args
exec cargo nextest run --profile ci $ARGS -E "$RUN_FILTER"
