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

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
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

# Publish a workspace package only if `<name>@<version>` isn't already on
# the registry. Keeps the whole script re-runnable: a failure on package
# N doesn't force the operator to manually skip the N-1 already-published
# packages on retry.
#
# Usage: publish_if_new <package-directory>
publish_if_new() {
  local dir="$1"
  local pkg_name pkg_version
  pkg_name="$(jq -r .name "$dir/package.json")"
  pkg_version="$(jq -r .version "$dir/package.json")"
  if npm view "${pkg_name}@${pkg_version}" version >/dev/null 2>&1; then
    log "  ↻ ${pkg_name}@${pkg_version} already on npm — skipping"
    return 0
  fi
  log "  ▲ publishing ${pkg_name}@${pkg_version}"
  (cd "$dir" && pnpm publish --access public --no-git-checks)
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
need brew

# npm auth — `pnpm publish` reads ~/.npmrc, so the user must have logged in.
if ! npm whoami >/dev/null 2>&1; then
  die "not logged into npm. run \`npm login\` first."
fi
log "npm user: $(npm whoami)"

# Detect npm 2FA mode (interactive OTP-per-publish needed?) and warn
# the operator up-front about how many OTP entries to expect. We do
# NOT block on it any more — the operator has decided to keep 2FA in
# `auth-and-writes` mode, so just count the publishes and tell them
# how many OTPs they'll be feeding.
npm_2fa_mode() {
  npm profile get tfa --json 2>/dev/null | jq -r '.mode // "off"'
}
TFA_MODE="$(npm_2fa_mode)"

# Count how many packages this run might publish (some will be skipped
# at `publish_if_new` time if already on the registry — this is the
# upper bound).
EXPECTED_PUBLISHES=$((
  1 +                                              # compiler
  1 +                                              # svelte2tsx
  ${#TRIPLES[@]} + 1 +                             # svelte-check 5 platforms + loader
  ${#TRIPLES[@]} + 1 +                             # vps-native 5 platforms + loader
  1                                                # vps shim (submodule)
))

case "$TFA_MODE" in
  auth-and-writes)
    cat >&2 <<EOF

  ⚠ npm 2FA is in "Authorization and writes" mode. pnpm will prompt for a
    fresh 6-digit OTP at every publish — up to $EXPECTED_PUBLISHES of them
    if no packages are skipped. Have your authenticator app ready; OTPs
    are single-use and refresh every 30 seconds.

    (Tip: an Automation token in ~/.npmrc bypasses 2FA entirely if you
    ever want to skip the OTP entry next time. Not required.)

EOF
    log "npm auth: 2FA \"auth-and-writes\" (~$EXPECTED_PUBLISHES OTP prompts expected)"
    ;;
  auth-only)
    log "npm auth: 2FA \"auth-only\" (no per-publish OTP)"
    ;;
  off)
    log "npm auth: 2FA off (no per-publish OTP)"
    ;;
  *)
    log "npm auth: 2FA mode \"$TFA_MODE\" (unknown; pnpm may prompt)"
    ;;
esac

# `cargo-zigbuild` + `zig` for Linux cross-compile targets. `cross`'s
# rustup-host probe doesn't survive on macOS hosts (it tries to install
# a host-side `stable-x86_64-unknown-linux-gnu` toolchain, which rustup
# can't materialise on Darwin and fails the whole flow). `zigbuild`
# uses Zig as the linker — no Docker, no host-toolchain dance.
if ! command -v zig >/dev/null 2>&1; then
  log "installing zig via Homebrew (one-time)…"
  brew install zig
fi
if ! command -v cargo-zigbuild >/dev/null 2>&1; then
  log "installing cargo-zigbuild (one-time)…"
  cargo install cargo-zigbuild --locked
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

step "sync version (apps/npm/compiler/package.json → Cargo.toml/.lock)" \
  pnpm run sync-version

# Build the WASM bundle only if pkg/ doesn't already reflect the current
# compiler version. Re-runs after a successful build skip the slow step.
COMPILER_VERSION="$(jq -r .version apps/npm/compiler/package.json)"
if [ ! -f pkg/package.json ] || [ "$(jq -r .version pkg/package.json 2>/dev/null || echo '')" != "$COMPILER_VERSION" ]; then
  step "wasm-pack build" \
    pnpm run build:wasm
  step "finalize pkg/package.json as @rsvelte/compiler" \
    pnpm run finalize-pkg
else
  log "↻ pkg/package.json already at $COMPILER_VERSION — skipping wasm rebuild"
fi

publish_if_new pkg

# ─────────────────────────────────────────────────────────────────────────────
# Phase 2: @rsvelte/svelte2tsx (pure JS)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 2/6: @rsvelte/svelte2tsx"
log "═════════════════════════════════════════════════════════════════════"

publish_if_new apps/npm/svelte2tsx

# ─────────────────────────────────────────────────────────────────────────────
# Phase 3: build native binaries for 5 triples (svelte-check + vps-native)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 3/6: cross-build native binaries (10 builds: 2 crates × 5 triples)"
log "═════════════════════════════════════════════════════════════════════"

# Build command selector — native cargo for darwin (we're on macOS),
# `cargo zigbuild` for Linux (uses Zig as the cross linker, no Docker),
# `cargo xwin` for Windows MSVC.
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
    *-unknown-linux-gnu)
      cargo zigbuild --release --target="$target" "${crate_args[@]}"
      ;;
    *)
      die "unsupported cross target: $target"
      ;;
  esac
}

# Cargo writes the binary as the bin target's `name` (`svelte_check`,
# underscore — cargo doesn't translate the filename). The loader package
# (`apps/npm/svelte-check/bin/svelte-check.cjs`) execs `svelte-check` /
# `svelte-check.exe` (dash), so we rename during the staging copy. CI
# does the same rename in its `Stage binary` step.
sc_src_for() {
  local target="$1"
  case "$target" in
    *-pc-windows-msvc) echo "svelte_check.exe" ;;
    *)                 echo "svelte_check" ;;
  esac
}
sc_dest_for() {
  local target="$1"
  case "$target" in
    *-pc-windows-msvc) echo "svelte-check.exe" ;;
    *)                 echo "svelte-check" ;;
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

# Returns 0 iff <name>@<version> from the given package.json is already
# on the npm registry — used to skip the expensive cross-build entirely
# when both per-triple packages for this target are already published.
is_published() {
  local dir="$1"
  local pkg_name pkg_version
  pkg_name="$(jq -r .name "$dir/package.json")"
  pkg_version="$(jq -r .version "$dir/package.json")"
  npm view "${pkg_name}@${pkg_version}" version >/dev/null 2>&1
}

# Stage outputs into the per-triple package directories.
for entry in "${TRIPLES[@]}"; do
  triple="${entry%%:*}"
  target="${entry##*:}"
  sc_dir="$REPO_ROOT/apps/npm/svelte-check-$triple"
  vps_dir="$REPO_ROOT/apps/npm/vite-plugin-svelte-native-$triple"

  # Skip the whole triple if both per-triple packages are already on npm
  # AT the local version. Saves ~3-10 min of cross-compile per triple.
  if is_published "$sc_dir" && is_published "$vps_dir"; then
    log "↻ $triple — both packages already published; skipping build"
    continue
  fi

  log "─── building $triple ($target) ───"

  # svelte-check binary
  if is_published "$sc_dir"; then
    log "  ↻ @rsvelte/svelte-check-$triple already published; skipping svelte_check build"
  else
    step "  svelte_check ($triple)" \
      build_for_target "$triple" "$target" --bin svelte_check
    sc_src="$(sc_src_for "$target")"
    sc_dest_name="$(sc_dest_for "$target")"
    sc_dest="$sc_dir/$sc_dest_name"
    cp "target/$target/release/$sc_src" "$sc_dest"
    [[ "$sc_dest_name" == *.exe ]] || chmod 755 "$sc_dest"
    # Sweep any wrongly-named legacy artifact from a previous run.
    rm -f "$sc_dir/svelte_check" "$sc_dir/svelte_check.exe"
    log "  staged $sc_dest ($(stat -f %z "$sc_dest" 2>/dev/null || stat -c %s "$sc_dest") bytes)"
  fi

  # NAPI cdylib for vps-native
  if is_published "$vps_dir"; then
    log "  ↻ @rsvelte/vite-plugin-svelte-native-$triple already published; skipping napi build"
  else
    step "  napi cdylib ($triple)" \
      build_for_target "$triple" "$target" --lib --features napi
    vps_dylib="$(dylib_for "$target")"
    vps_dest="$vps_dir/rsvelte.node"
    cp "target/$target/release/$vps_dylib" "$vps_dest"
    log "  staged $vps_dest ($(stat -f %z "$vps_dest" 2>/dev/null || stat -c %s "$vps_dest") bytes)"
  fi
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
  publish_if_new "apps/npm/svelte-check-$triple"
done

publish_if_new apps/npm/svelte-check

# ─────────────────────────────────────────────────────────────────────────────
# Phase 5: publish vps-native (platforms first, then loader)
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " Phase 5/6: @rsvelte/vite-plugin-svelte-native (5 + 1)"
log "═════════════════════════════════════════════════════════════════════"

for entry in "${TRIPLES[@]}"; do
  triple="${entry%%:*}"
  publish_if_new "apps/npm/vite-plugin-svelte-native-$triple"
done

publish_if_new apps/npm/vite-plugin-svelte-native

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

# Skip the whole submodule dance if VPS_VERSION is already published.
if npm view "@rsvelte/vite-plugin-svelte@$VPS_VERSION" version >/dev/null 2>&1; then
  log "↻ @rsvelte/vite-plugin-svelte@$VPS_VERSION already on npm — skipping submodule publish"
else
  # Make sure we're on the `rsvelte` branch (the submodule is checked out
  # at a detached HEAD by default). `checkout` is idempotent on a branch
  # we're already on.
  log "switching submodule to rsvelte branch"
  (cd "$SUBMODULE_PATH" && git checkout rsvelte && git pull origin rsvelte --ff-only)

  # Bump version + pin dependency floors to what we just published. The shim's
  # package.json already names @rsvelte/vite-plugin-svelte-native and
  # @rsvelte/compiler in dependencies; we just patch the version specifiers.
  # `jq` rewrite is idempotent — if the file is already at the target shape,
  # `git diff --quiet` later short-circuits the commit step.
  log "patching $SHIM_DIR/package.json to v$VPS_VERSION"
  SHIM_PKG="$SHIM_DIR/package.json"
  COMPILER_VERSION="$(jq -r .version "$REPO_ROOT/apps/npm/compiler/package.json")"
  VPS_NATIVE_VERSION="$(jq -r .version "$REPO_ROOT/apps/npm/vite-plugin-svelte-native/package.json")"
  jq \
    --arg v       "$VPS_VERSION" \
    --arg compv   ">=$COMPILER_VERSION" \
    --arg natv    ">=$VPS_NATIVE_VERSION" \
    '.version = $v
     | .dependencies["@rsvelte/compiler"] = $compv
     | .dependencies["@rsvelte/vite-plugin-svelte-native"] = $natv' \
    "$SHIM_PKG" > "$SHIM_PKG.tmp" && mv "$SHIM_PKG.tmp" "$SHIM_PKG"

  # The submodule's pnpm workspace still has e2e-tests packages that
  # depend on `@sveltejs/vite-plugin-svelte@workspace:^`. The shim was
  # renamed to `@rsvelte/vite-plugin-svelte` (PR #2/#3 on the fork), so
  # a normal `pnpm install` from the shim dir resolves the whole
  # workspace and 500s on the now-dangling e2e workspace deps. Install
  # the shim as a standalone package with `--ignore-workspace`.
  step "install submodule shim deps (standalone, ignore-workspace)" \
    bash -c "cd '$SHIM_DIR' && pnpm install --no-frozen-lockfile --ignore-workspace"

  # Regenerate types only if they aren't already present from a prior
  # build. The `types/index.d.ts` is checked in to the fork, so for a
  # plain "publish today's fork HEAD" run this step is a no-op.
  if [ -f "$SHIM_DIR/types/index.d.ts" ]; then
    log "↻ $SHIM_DIR/types/index.d.ts already exists — skipping type regen"
  else
    step "generate shim types" \
      bash -c "cd '$SHIM_DIR' && pnpm run check:types && pnpm run generate:types || true"
  fi

  step "publish @rsvelte/vite-plugin-svelte" \
    bash -c "cd '$SHIM_DIR' && pnpm publish --access public --no-git-checks"

  # Commit + push the version bump in the submodule. Both steps are
  # no-ops if there's nothing new to commit / nothing new to push, which
  # is exactly what we want on a re-run after a partial failure.
  log "committing version bump in submodule"
  (cd "$SUBMODULE_PATH"
    git add packages/vite-plugin-svelte/package.json
    if ! git diff --cached --quiet; then
      git commit -m "chore(release): @rsvelte/vite-plugin-svelte $VPS_VERSION"
    else
      log "  ↻ no submodule changes to commit"
    fi
    git push origin rsvelte || log "  ↻ submodule push: nothing to push"
  )

  # Bump the submodule pointer in the parent repo so the new SHA is what
  # everyone else's checkout uses. `git diff --cached --quiet` skips the
  # commit on re-runs where the pointer is already up to date.
  git add "$SUBMODULE_PATH"
  if ! git diff --cached --quiet -- "$SUBMODULE_PATH"; then
    git commit -m "chore: bump vite-plugin-svelte submodule to $VPS_VERSION"
  else
    log "↻ submodule pointer already up to date in parent repo"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────────

log ""
log "═════════════════════════════════════════════════════════════════════"
log " ✅ All publishes complete."
log "═════════════════════════════════════════════════════════════════════"
log ""
log "Verify:"
log "  npm view @rsvelte/compiler version                   # $(jq -r .version "$REPO_ROOT/apps/npm/compiler/package.json")"
log "  npm view @rsvelte/svelte2tsx version                 # $(jq -r .version "$REPO_ROOT/apps/npm/svelte2tsx/package.json")"
log "  npm view @rsvelte/svelte-check version               # $(jq -r .version "$REPO_ROOT/apps/npm/svelte-check/package.json")"
log "  npm view @rsvelte/vite-plugin-svelte-native version  # $(jq -r .version "$REPO_ROOT/apps/npm/vite-plugin-svelte-native/package.json")"
log "  npm view @rsvelte/vite-plugin-svelte version         # $VPS_VERSION"
log ""
log "Don't forget to push the submodule-pointer commit to main:"
log "  git push"
