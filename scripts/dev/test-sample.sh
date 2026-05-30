#!/usr/bin/env bash
# Run a single fixture sample with debug output enabled.
#
# Usage:
#   scripts/dev/test-sample.sh <suite> <sample-name>
#
# <suite> is one of:
#   parser-modern, parser-legacy,
#   compiler-snapshot, compiler-errors,
#   css, validator, ssr, hydration,
#   runtime-runes, runtime-legacy, runtime-browser,
#   sourcemaps, print
#
# This script:
#   1. Regenerates only the requested fixture (if a generator supports --sample)
#   2. Runs the corresponding cargo integration test single-threaded
#   3. Sets DEBUG_TEST=<sample> so the runner prints canonical diffs on failure
#
# Examples:
#   scripts/dev/test-sample.sh runtime-runes await-block-state
#   scripts/dev/test-sample.sh ssr if-block

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <suite> <sample-name>" >&2
  exit 64
fi

SUITE="$1"
SAMPLE="$2"

# Map suite -> cargo test binary
case "$SUITE" in
  parser-modern|parser-legacy)
    TEST_BIN="parser_fixtures"
    GEN_CATEGORY="$SUITE"
    ;;
  compiler-snapshot|snapshot)
    TEST_BIN="compiler_fixtures"
    GEN_CATEGORY="snapshot"
    ;;
  compiler-errors)
    TEST_BIN="compiler_errors"
    GEN_CATEGORY="compiler-errors"
    ;;
  css)
    TEST_BIN="css"
    GEN_CATEGORY="css"
    ;;
  validator)
    TEST_BIN="validator"
    GEN_CATEGORY="validator"
    ;;
  ssr|server-side-rendering)
    TEST_BIN="ssr"
    GEN_CATEGORY="server-side-rendering"
    ;;
  hydration)
    TEST_BIN="runtime"
    GEN_CATEGORY="hydration"
    ;;
  runtime-runes|runtime-legacy|runtime-browser)
    TEST_BIN="runtime"
    GEN_CATEGORY="$SUITE"
    ;;
  sourcemaps)
    TEST_BIN="sourcemaps"
    GEN_CATEGORY="sourcemaps"
    ;;
  print)
    TEST_BIN="print"
    GEN_CATEGORY="print"
    ;;
  *)
    echo "unknown suite: $SUITE" >&2
    echo "see scripts/dev/test-sample.sh --help for valid suites" >&2
    exit 64
    ;;
esac

cd "$(dirname "$0")/../.."

# Regenerate just this sample's fixture (best-effort; full regen is fine too)
if command -v pnpm >/dev/null; then
  PKG_RUN="pnpm run"
else
  PKG_RUN="npm run"
fi

echo ">>> Regenerating fixture for $GEN_CATEGORY/$SAMPLE"
$PKG_RUN generate-fixtures -- --category="$GEN_CATEGORY" --sample="$SAMPLE" --force || \
  echo "(fixture regeneration failed; falling back to existing fixture)" >&2

echo ">>> Running tests/$TEST_BIN.rs (single-threaded, DEBUG_TEST=$SAMPLE)"
RUST_TEST_THREADS=1 \
RAYON_NUM_THREADS=1 \
DEBUG_TEST="$SAMPLE" \
DEBUG_RAW="$SAMPLE" \
WRITE_ACTUAL_OUTPUT=1 \
  cargo test --test "$TEST_BIN" -- --nocapture
