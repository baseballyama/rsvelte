#!/usr/bin/env bash
# Build rsvelte's NAPI binding and copy it into the locations needed for
# compatibility verification.
#
# Usage:
#   build-rsvelte.sh [target-path]
#
# When target-path is supplied, the .node binary is also copied to
# <target-path>/.rsvelte/<NODE_NAME>. Always copies to svelte/<NODE_NAME>
# (used by scripts/test-real-world*.mjs).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
TARGET_PATH="${1:-}"

case "$(uname -s)-$(uname -m)" in
  Darwin-arm64)   EXT="dylib"; NODE_NAME="rsvelte.darwin-arm64.node" ;;
  Darwin-x86_64)  EXT="dylib"; NODE_NAME="rsvelte.darwin-x64.node" ;;
  Linux-x86_64)   EXT="so";    NODE_NAME="rsvelte.linux-x64-gnu.node" ;;
  Linux-aarch64)  EXT="so";    NODE_NAME="rsvelte.linux-arm64-gnu.node" ;;
  *) echo "Unsupported platform: $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac

cd "$ROOT"

echo "[build-rsvelte] cargo build --release --features napi --lib"
cargo build --release --features napi --lib

SRC="target/release/librsvelte_core.${EXT}"
if [ ! -f "$SRC" ]; then
  echo "[build-rsvelte] ERROR: build output not found: $SRC" >&2
  exit 1
fi

# Always copy under svelte/ for legacy script compatibility
cp "$SRC" "svelte/${NODE_NAME}"
echo "[build-rsvelte] -> svelte/${NODE_NAME}"

if [ -n "$TARGET_PATH" ] && [ -d "$TARGET_PATH" ]; then
  mkdir -p "${TARGET_PATH}/.rsvelte"
  cp "$SRC" "${TARGET_PATH}/.rsvelte/${NODE_NAME}"
  echo "[build-rsvelte] -> ${TARGET_PATH}/.rsvelte/${NODE_NAME}"
fi

echo "$NODE_NAME"
