#!/usr/bin/env bash
# Standalone local publish for the @rsvelte/lint npm package family.
#
# Publishes (in dependency-safe order):
#   1. @rsvelte/lint-<5 triples>   (per-platform native rsvelte-lint binary)
#   2. @rsvelte/lint               (loader; optionalDeps -> 5 triples)
#
# This exists as its own script (rather than a phase in publish-all-local.sh)
# so the FIRST manual publish of @rsvelte/lint can be run in isolation, and so
# publish-all-local.sh can delegate to it without duplicating the dist-lint
# cross-build logic.
#
# Versions are taken from the on-disk package.json files — bump those BEFORE
# running this (they must all match `crates/rsvelte_lint/Cargo.toml`, kept in
# sync by `pnpm run sync-version`). The script does not modify any version.
#
# Re-runnable: `pnpm publish` / `npm publish` skips versions already on the
# registry, so a mid-flight failure can be recovered by re-running.
#
# IMPORTANT: rsvelte-lint is built with `--profile dist-lint` (NOT `release`
# or `dist`). The linter isolates a per-file compiler panic via `catch_unwind`,
# which only works when the binary UNWINDS. `release`/`dist` set
# `panic = "abort"`, turning that isolation into a whole-run SIGABRT.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

# Native-binary triples. Keep in sync with .github/workflows/release.yml's
# `build-rsvelte-lint` matrix and publish-all-local.sh's TRIPLES.
TRIPLES=(
  "darwin-arm64:aarch64-apple-darwin"
  "darwin-x64:x86_64-apple-darwin"
  "linux-x64-gnu:x86_64-unknown-linux-gnu"
  "linux-arm64-gnu:aarch64-unknown-linux-gnu"
  "win32-x64-msvc:x86_64-pc-windows-msvc"
)

log()  { printf '\033[1;34m[publish-lint]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[publish-lint]\033[0m %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"; }

# Publish a package only if `<name>@<version>` isn't already on the registry.
# @rsvelte/lint-<triple> POSIX packages ship an executable binary and MUST be
# published with `npm publish` (npm preserves file modes; `pnpm pack` normalises
# them to 0644, dropping +x). The loader is a plain JS package — pnpm is fine.
publish_if_new() {
  local dir="$1"
  local publisher="${2:-pnpm}" # "pnpm" (loader) | "npm" (executable binary)
  local pkg_name pkg_version
  pkg_name="$(jq -r .name "$dir/package.json")"
  pkg_version="$(jq -r .version "$dir/package.json")"
  if npm view "${pkg_name}@${pkg_version}" version >/dev/null 2>&1; then
    log "  ↻ ${pkg_name}@${pkg_version} already on npm — skipping"
    return 0
  fi
  log "  ▲ publishing ${pkg_name}@${pkg_version} (via ${publisher})"
  if [ "$publisher" = "npm" ]; then
    (cd "$dir" && npm publish --access public)
  else
    (cd "$dir" && pnpm publish --access public --no-git-checks)
  fi
}

# ─── Pre-flight ──────────────────────────────────────────────────────────────

log "Pre-flight checks…"
need node
need pnpm
need cargo
need rustup
need git
need jq
need brew

if ! npm whoami >/dev/null 2>&1; then
  die "not logged into npm. run \`npm login\` first."
fi
log "npm user: $(npm whoami)"

# `cargo-zigbuild` + `zig` for Linux cross-compile; `cargo-xwin` for Windows
# MSVC. Same toolchain choice as publish-all-local.sh (no Docker, no host
# toolchain dance on macOS).
if ! command -v zig >/dev/null 2>&1; then
  log "installing zig via Homebrew (one-time)…"
  brew install zig
fi
if ! command -v cargo-zigbuild >/dev/null 2>&1; then
  log "installing cargo-zigbuild (one-time)…"
  cargo install cargo-zigbuild --locked
fi
if ! command -v cargo-xwin >/dev/null 2>&1; then
  log "installing cargo-xwin (one-time)…"
  cargo install cargo-xwin --locked
fi

for entry in "${TRIPLES[@]}"; do
  target="${entry##*:}"
  rustup target add "$target" >/dev/null 2>&1 || true
done

log "Pre-flight OK."

# ─── Cross-build ─────────────────────────────────────────────────────────────

# Build rsvelte-lint (CLI bin + NAPI `.node` addon) for one target with the
# dist-lint profile. Native cargo for darwin (we're on macOS), zigbuild for
# Linux, xwin for Windows MSVC. The addon uses `--features napi --lib
# -p rsvelte_lint` (scoped so `--features napi` doesn't also touch rsvelte_core).
build_lint_for_target() {
  local target="$1"
  case "$target" in
    *-apple-darwin)
      cargo build --profile dist-lint --bin rsvelte-lint --target="$target"
      cargo build --profile dist-lint --features napi --lib -p rsvelte_lint --target="$target"
      ;;
    x86_64-pc-windows-msvc)
      cargo xwin build --profile dist-lint --bin rsvelte-lint --target="$target"
      cargo xwin build --profile dist-lint --features napi --lib -p rsvelte_lint --target="$target"
      ;;
    *-unknown-linux-gnu)
      cargo zigbuild --profile dist-lint --bin rsvelte-lint --target="$target"
      cargo zigbuild --profile dist-lint --features napi --lib -p rsvelte_lint --target="$target"
      ;;
    *)
      die "unsupported cross target: $target"
      ;;
  esac
}

# Returns 0 iff <name>@<version> from the given package.json is already on npm.
is_published() {
  local dir="$1"
  local pkg_name pkg_version
  pkg_name="$(jq -r .name "$dir/package.json")"
  pkg_version="$(jq -r .version "$dir/package.json")"
  npm view "${pkg_name}@${pkg_version}" version >/dev/null 2>&1
}

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Cross-build rsvelte-lint (5 triples, --profile dist-lint)"
log "═════════════════════════════════════════════════════════════════════"

for entry in "${TRIPLES[@]}"; do
  triple="${entry%%:*}"
  target="${entry##*:}"
  lint_dir="$REPO_ROOT/apps/npm/lint-$triple"

  if is_published "$lint_dir"; then
    log "↻ @rsvelte/lint-$triple already published; skipping build"
    continue
  fi

  log "─── building $triple ($target) ───"
  build_lint_for_target "$target"

  case "$target" in
    *-pc-windows-msvc) src="rsvelte-lint.exe"; dest_name="rsvelte-lint.exe"; dylib="rsvelte_lint.dll" ;;
    *-apple-darwin)    src="rsvelte-lint";     dest_name="rsvelte-lint";     dylib="librsvelte_lint.dylib" ;;
    *)                 src="rsvelte-lint";     dest_name="rsvelte-lint";     dylib="librsvelte_lint.so" ;;
  esac
  dest="$lint_dir/$dest_name"
  cp "target/$target/dist-lint/$src" "$dest"
  [[ "$dest_name" == *.exe ]] || chmod 755 "$dest"
  log "  staged $dest ($(stat -f %z "$dest" 2>/dev/null || stat -c %s "$dest") bytes)"
  # NAPI addon (dlopen'd, not exec'd — no +x needed).
  node_dest="$lint_dir/rsvelte_lint.node"
  cp "target/$target/dist-lint/$dylib" "$node_dest"
  log "  staged $node_dest ($(stat -f %z "$node_dest" 2>/dev/null || stat -c %s "$node_dest") bytes)"
done

# ─── Publish ─────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Publish @rsvelte/lint (5 platform packages + 1 loader)"
log "═════════════════════════════════════════════════════════════════════"

for entry in "${TRIPLES[@]}"; do
  triple="${entry%%:*}"
  # POSIX binaries via npm (preserves +x); Windows .exe ignores mode bits, but
  # npm is harmless there too — use npm uniformly for the platform packages.
  publish_if_new "apps/npm/lint-$triple" npm
done

publish_if_new apps/npm/lint pnpm

log ""
log "═════════════════════════════════════════════════════════════════════"
log " ✅ @rsvelte/lint publish complete."
log "═════════════════════════════════════════════════════════════════════"
log ""
log "Verify:"
log "  npm view @rsvelte/lint version   # $(jq -r .version "$REPO_ROOT/apps/npm/lint/package.json")"
