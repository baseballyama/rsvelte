#!/usr/bin/env bash
set -euo pipefail

cargo check --locked -p rsvelte_core --no-default-features --lib

dependency_tree="$(cargo tree --locked -p rsvelte_core --no-default-features --edges normal --depth 1 --prefix none)"
printf '%s\n' "$dependency_tree"

for tooling_dependency in chrono clap notify oxc_formatter oxc_resolver walkdir; do
  if [[ "$dependency_tree" == *"$tooling_dependency "* ]]; then
    printf 'compiler-only rsvelte_core unexpectedly depends on %s\n' "$tooling_dependency" >&2
    exit 1
  fi
done

# rsvelte_core can be published after this leaf crate is present in crates.io.
cargo package --locked -p rsvelte_esrap --no-verify
