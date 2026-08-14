#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
temp_root="$(mktemp -d)"
trap 'rm -rf "$temp_root"' EXIT
registry_target_dir="${CARGO_TARGET_DIR:-$repo_root/target/registry-surface}"

mkdir -p "$temp_root/crates"

copy_library_crate() {
  local crate="$1"
  local source="$repo_root/crates/$crate"
  local target="$temp_root/crates/$crate"

  mkdir -p "$target"
  cp "$source/Cargo.toml" "$target/"
  for doc in README.md LICENSE; do
    if [[ -f "$source/$doc" ]]; then
      cp "$source/$doc" "$target/"
    fi
  done
  cp -R "$source/src" "$target/src"
  if [[ -f "$source/build.rs" ]]; then
    cp "$source/build.rs" "$target/build.rs"
  fi
  if [[ -f "$source/svelte-version.txt" ]]; then
    cp "$source/svelte-version.txt" "$target/svelte-version.txt"
  fi
}

# Not published (dev-dependency of rsvelte_core's test suite), but its manifest
# must exist for cargo to load the workspace members that name it.
copy_library_crate rsvelte_ast_equiv
copy_library_crate rsvelte_core
copy_library_crate rsvelte_projection
copy_library_crate rsvelte

cat >"$temp_root/Cargo.toml" <<'EOF'
[workspace]
resolver = "3"
members = [
  "crates/rsvelte",
  "crates/rsvelte_ast_equiv",
  "crates/rsvelte_core",
  "crates/rsvelte_projection",
]

[workspace.lints.rust]
unsafe_op_in_unsafe_fn = "deny"

[workspace.lints.clippy]
undocumented_unsafe_blocks = "deny"
format_push_string = "deny"
too_many_arguments = "allow"
type_complexity = "allow"
EOF

# This temporary workspace deliberately has no `[patch.crates-io]`: OXC and
# every other third-party dependency must resolve from the registry exactly as
# they will for a crates.io consumer. Internal rsvelte dependencies retain
# their reviewed sibling paths.
CARGO_TARGET_DIR="$registry_target_dir" cargo check \
  --manifest-path "$temp_root/Cargo.toml" --workspace --all-features --lib
CARGO_TARGET_DIR="$registry_target_dir" cargo test \
  --manifest-path "$temp_root/Cargo.toml" -p rsvelte_core --no-default-features --lib
CARGO_TARGET_DIR="$registry_target_dir" cargo test \
  --manifest-path "$temp_root/Cargo.toml" -p rsvelte_projection --no-default-features --lib
CARGO_TARGET_DIR="$registry_target_dir" cargo test \
  --manifest-path "$temp_root/Cargo.toml" -p rsvelte --all-features --lib

if CARGO_TARGET_DIR="$registry_target_dir" cargo tree \
  --manifest-path "$temp_root/Cargo.toml" --workspace |
  grep -F "git+https://github.com/oxc-project/oxc"; then
  echo "registry dependency verification unexpectedly used the workspace OXC git patch" >&2
  exit 1
fi

echo "Registry dependency surface verified without workspace patches."
