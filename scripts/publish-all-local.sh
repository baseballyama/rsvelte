#!/usr/bin/env bash
# One-shot local publish for the entire @rsvelte/ npm ecosystem.
#
# Publishes (in dependency-safe order):
#   1. @rsvelte/compiler                                    (WASM via wasm-pack)
#   2. @rsvelte/svelte2tsx                                  (pure JS, depends on compiler)
#   3. @rsvelte/svelte-check-<5 triples>                    (per-platform Rust binary)
#   4. @rsvelte/svelte-check                                (loader; optionalDeps -> 5 triples)
#   5. @rsvelte/vite-plugin-svelte-native-<5 triples>       (per-platform NAPI .node)
#   6. @rsvelte/vite-plugin-svelte-native                   (loader; optionalDeps -> 5 triples)
#   7. @rsvelte/vite-plugin-svelte                          (submodule fork; depends on #1 + #6)
#
# Versions are taken from the on-disk package.json files — bump those BEFORE
# running this. The script does not modify any version field except the
# submodule's `@rsvelte/vite-plugin-svelte` (which it bumps to match the
# `VPS_VERSION` constant below, since the submodule lives in a separate
# repo).
#
# Re-runnable: `pnpm publish` skips versions already on the registry, so a
# mid-flight failure can be recovered by re-running.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Bump this when you want a new submodule-side publish. The script writes
# this into the submodule's package.json and commits before publishing.
VPS_VERSION="0.3.0"

# Native-binary triples to build for both svelte-check and vps-native. Keep
# in sync with .github/workflows/release.yml's matrix.
TRIPLES=(
  "darwin-arm64:aarch64-apple-darwin"
  "darwin-x64:x86_64-apple-darwin"
  "linux-x64-gnu:x86_64-unknown-linux-gnu"
  "linux-arm64-gnu:aarch64-unknown-linux-gnu"
  "win32-x64-msvc:x86_64-pc-windows-msvc"
)

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

log()  { printf '\033[1;34m[publish-all]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[publish-all]\033[0m %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"; }

# Run a command in a subshell with a `[step] ...` heading so the log is
# easy to follow during the long native-build phase.
step() {
  local label="$1"; shift
  log "▶ $label"
  "$@"
}

# ─────────────────────────────────────────────────────────────────────────────
# Pre-flight
# ─────────────────────────────────────────────────────────────────────────────

log "Pre-flight checks…"

need node
need pnpm
need cargo
need rustup
need git
need jq
need docker

# npm auth — `pnpm publish` reads ~/.npmrc, so the user must have logged in.
if ! npm whoami >/dev/null 2>&1; then
  die "not logged into npm. run \`npm login\` first."
fi
log "npm user: $(npm whoami)"

# Docker daemon must be running for `cross`.
if ! docker info >/dev/null 2>&1; then
  die "docker is installed but the daemon is not running. start Docker Desktop."
fi

# `cross` is the cleanest path for Linux cross-compile targets (it spins up
# pre-built Docker images with the right cross toolchains).
if ! command -v cross >/dev/null 2>&1; then
  log "installing cross (one-time)…"
  cargo install cross --locked
fi

# `cargo-xwin` for Windows MSVC cross-compile. First run will download the
# MSVC SDK headers/libs (~150 MB) into ~/.cache/cargo-xwin/.
if ! command -v cargo-xwin >/dev/null 2>&1; then
  log "installing cargo-xwin (one-time)…"
  cargo install cargo-xwin --locked
fi

# Rustup targets. `rustup target add` is idempotent.
for entry in "${TRIPLES[@]}"; do
  target="${entry##*:}"
  rustup target add "$target" >/dev/null 2>&1 || true
done
rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true

# wasm-pack for the compiler WASM build.
if ! command -v wasm-pack >/dev/null 2>&1; then
  log "installing wasm-pack (one-time)…"
  curl -sSf https://rustwasm.github.io/wasm-pack/installer/init.sh | sh
fi

# Submodule must be initialized for the @rsvelte/vite-plugin-svelte publish.
if [ ! -f submodules/vite-plugin-svelte/packages/vite-plugin-svelte/package.json ]; then
  log "initializing vite-plugin-svelte submodule…"
  git submodule update --init submodules/vite-plugin-svelte
fi

log "Pre-flight OK."

# ─────────────────────────────────────────────────────────────────────────────
# Phase 1: @rsvelte/compiler (WASM)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 1/6: @rsvelte/compiler"
log "═════════════════════════════════════════════════════════════════════"

step "sync version (npm/compiler/package.json → Cargo.toml/.lock)" \
  pnpm run sync-version

step "wasm-pack build" \
  pnpm run build:wasm

step "finalize pkg/package.json as @rsvelte/compiler" \
  pnpm run finalize-pkg

step "publish pkg/" \
  bash -c 'cd pkg && pnpm publish --access public --no-git-checks'

# ─────────────────────────────────────────────────────────────────────────────
# Phase 2: @rsvelte/svelte2tsx (pure JS)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 2/6: @rsvelte/svelte2tsx"
log "═════════════════════════════════════════════════════════════════════"

step "publish npm/svelte2tsx" \
  bash -c 'cd npm/svelte2tsx && pnpm publish --access public --no-git-checks'

# ─────────────────────────────────────────────────────────────────────────────
# Phase 3: build native binaries for 5 triples (svelte-check + vps-native)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 3/6: cross-build native binaries (10 builds: 2 crates × 5 triples)"
log "═════════════════════════════════════════════════════════════════════"

# Build command selector — native cargo for darwin (we're on macOS), `cross`
# for Linux, `cargo xwin` for Windows MSVC.
build_for_target() {
  local triple="$1"   # e.g. "darwin-arm64"
  local target="$2"   # e.g. "aarch64-apple-darwin"
  local crate_args=("${@:3}")  # remaining args: --bin svelte_check OR --lib --features napi

  case "$target" in
    *-apple-darwin)
      cargo build --release --target="$target" "${crate_args[@]}"
      ;;
    x86_64-pc-windows-msvc)
      cargo xwin build --release --target="$target" "${crate_args[@]}"
      ;;
    *)
      cross build --release --target="$target" "${crate_args[@]}"
      ;;
  esac
}

# Linker artifact name depends on the target.
sc_binary_for() {
  local target="$1"
  case "$target" in
    *-pc-windows-msvc) echo "svelte_check.exe" ;;
    *)                 echo "svelte_check" ;;
  esac
}

dylib_for() {
  local target="$1"
  case "$target" in
    *-apple-darwin)    echo "libsvelte_compiler_rust.dylib" ;;
    *-unknown-linux-*) echo "libsvelte_compiler_rust.so" ;;
    *-pc-windows-msvc) echo "svelte_compiler_rust.dll" ;;
  esac
}

# Stage outputs into the per-triple package directories.
for entry in "${TRIPLES[@]}"; do
  triple="${entry%%:*}"
  target="${entry##*:}"
  log "─── building $triple ($target) ───"

  # svelte-check binary
  step "  svelte_check ($triple)" \
    build_for_target "$triple" "$target" --bin svelte_check
  sc_bin="$(sc_binary_for "$target")"
  sc_dest_dir="$REPO_ROOT/npm/svelte-check-$triple"
  sc_dest="$sc_dest_dir/$sc_bin"
  cp "target/$target/release/$sc_bin" "$sc_dest"
  [[ "$sc_bin" == *.exe ]] || chmod 755 "$sc_dest"
  log "  staged $sc_dest ($(stat -f %z "$sc_dest" 2>/dev/null || stat -c %s "$sc_dest") bytes)"

  # NAPI cdylib for vps-native
  step "  napi cdylib ($triple)" \
    build_for_target "$triple" "$target" --lib --features napi
  vps_dylib="$(dylib_for "$target")"
  vps_dest_dir="$REPO_ROOT/npm/vite-plugin-svelte-native-$triple"
  vps_dest="$vps_dest_dir/rsvelte.node"
  cp "target/$target/release/$vps_dylib" "$vps_dest"
  log "  staged $vps_dest ($(stat -f %z "$vps_dest" 2>/dev/null || stat -c %s "$vps_dest") bytes)"
done

# ─────────────────────────────────────────────────────────────────────────────
# Phase 4: publish svelte-check (platforms first, then loader)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 4/6: @rsvelte/svelte-check (5 platform packages + 1 loader)"
log "═════════════════════════════════════════════════════════════════════"

for entry in "${TRIPLES[@]}"; do
  triple="${entry%%:*}"
  step "publish @rsvelte/svelte-check-$triple" \
    bash -c "cd npm/svelte-check-$triple && pnpm publish --access public --no-git-checks"
done

step "publish @rsvelte/svelte-check (loader)" \
  bash -c 'cd npm/svelte-check && pnpm publish --access public --no-git-checks'

# ─────────────────────────────────────────────────────────────────────────────
# Phase 5: publish vps-native (platforms first, then loader)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 5/6: @rsvelte/vite-plugin-svelte-native (5 + 1)"
log "═════════════════════════════════════════════════════════════════════"

for entry in "${TRIPLES[@]}"; do
  triple="${entry%%:*}"
  step "publish @rsvelte/vite-plugin-svelte-native-$triple" \
    bash -c "cd npm/vite-plugin-svelte-native-$triple && pnpm publish --access public --no-git-checks"
done

step "publish @rsvelte/vite-plugin-svelte-native (loader)" \
  bash -c 'cd npm/vite-plugin-svelte-native && pnpm publish --access public --no-git-checks'

# ─────────────────────────────────────────────────────────────────────────────
# Phase 6: submodule — @rsvelte/vite-plugin-svelte (JS shim)
# ─────────────────────────────────────────────────────────────────────────────
# The shim lives in a separate repo. We bump its package.json to
# $VPS_VERSION, install deps, publish, then push the version commit to the
# submodule's `rsvelte` branch so the change is durable.

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 6/6: @rsvelte/vite-plugin-svelte (submodule fork)"
log "═════════════════════════════════════════════════════════════════════"

SUBMODULE_PATH="submodules/vite-plugin-svelte"
SHIM_DIR="$SUBMODULE_PATH/packages/vite-plugin-svelte"

# Make sure we're on the `rsvelte` branch (the submodule is checked out
# at a detached HEAD by default).
log "switching submodule to rsvelte branch"
(cd "$SUBMODULE_PATH" && git checkout rsvelte && git pull origin rsvelte --ff-only)

# Bump version + pin dependency floors to what we just published. The shim's
# package.json already names @rsvelte/vite-plugin-svelte-native and
# @rsvelte/compiler in dependencies; we just patch the version specifiers.
log "patching $SHIM_DIR/package.json to v$VPS_VERSION"
SHIM_PKG="$SHIM_DIR/package.json"
COMPILER_VERSION="$(jq -r .version "$REPO_ROOT/npm/compiler/package.json")"
VPS_NATIVE_VERSION="$(jq -r .version "$REPO_ROOT/npm/vite-plugin-svelte-native/package.json")"
jq \
  --arg v       "$VPS_VERSION" \
  --arg compv   ">=$COMPILER_VERSION" \
  --arg natv    ">=$VPS_NATIVE_VERSION" \
  '.version = $v
   | .dependencies["@rsvelte/compiler"] = $compv
   | .dependencies["@rsvelte/vite-plugin-svelte-native"] = $natv' \
  "$SHIM_PKG" > "$SHIM_PKG.tmp" && mv "$SHIM_PKG.tmp" "$SHIM_PKG"

step "install submodule shim deps" \
  bash -c "cd '$SHIM_DIR' && pnpm install --no-frozen-lockfile"

step "generate shim types" \
  bash -c "cd '$SHIM_DIR' && pnpm run check:types && pnpm run generate:types || true"

step "publish @rsvelte/vite-plugin-svelte" \
  bash -c "cd '$SHIM_DIR' && pnpm publish --access public --no-git-checks"

# Commit the version bump in the submodule and push it.
log "committing version bump in submodule"
(cd "$SUBMODULE_PATH"
  git add packages/vite-plugin-svelte/package.json
  git commit -m "chore(release): @rsvelte/vite-plugin-svelte $VPS_VERSION"
  git push origin rsvelte)

# Bump the submodule pointer in the parent repo so the new SHA is what
# everyone else's checkout uses.
git add "$SUBMODULE_PATH"
git commit -m "chore: bump vite-plugin-svelte submodule to $VPS_VERSION" || true

# ─────────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " ✅ All publishes complete."
log "═════════════════════════════════════════════════════════════════════"
log ""
log "Verify:"
log "  npm view @rsvelte/compiler version                   # $(jq -r .version "$REPO_ROOT/npm/compiler/package.json")"
log "  npm view @rsvelte/svelte2tsx version                 # $(jq -r .version "$REPO_ROOT/npm/svelte2tsx/package.json")"
log "  npm view @rsvelte/svelte-check version               # $(jq -r .version "$REPO_ROOT/npm/svelte-check/package.json")"
log "  npm view @rsvelte/vite-plugin-svelte-native version  # $(jq -r .version "$REPO_ROOT/npm/vite-plugin-svelte-native/package.json")"
log "  npm view @rsvelte/vite-plugin-svelte version         # $VPS_VERSION"
log ""
log "Don't forget to push the submodule-pointer commit to main:"
log "  git push"
