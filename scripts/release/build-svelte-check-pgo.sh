#!/usr/bin/env bash
set -Eeuo pipefail

export LC_ALL=C

readonly TARGET="x86_64-unknown-linux-gnu"
readonly PROFILE="dist"
readonly TRAINING_PASSES="${PGO_TRAINING_PASSES:-3}"
readonly TRAINING_REPLICAS="${PGO_TRAINING_REPLICAS:-64}"

dry_run=false
if [[ "${1:-}" == "--dry-run" ]]; then
  dry_run=true
  shift
fi
if (( $# != 0 )); then
  echo "usage: $0 [--dry-run]" >&2
  exit 2
fi

die() {
  echo "build-svelte-check-pgo: $*" >&2
  exit 1
}

is_positive_integer() {
  [[ "$1" =~ ^[1-9][0-9]*$ ]]
}

is_positive_integer "$TRAINING_PASSES" || die "PGO_TRAINING_PASSES must be a positive integer"
(( TRAINING_PASSES >= 2 )) || die "PGO_TRAINING_PASSES must be at least 2"
is_positive_integer "$TRAINING_REPLICAS" || die "PGO_TRAINING_REPLICAS must be a positive integer"

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
readonly CORPUS_DIR="$REPO_ROOT/benches/corpus"
readonly OUTPUT_PATH="${PGO_OUTPUT_PATH:-$REPO_ROOT/target/$TARGET/$PROFILE/svelte_check}"

[[ -d "$CORPUS_DIR" ]] || die "benchmark corpus is missing: $CORPUS_DIR"
if [[ -n "${RUSTFLAGS:-}" || -n "${CARGO_ENCODED_RUSTFLAGS:-}" ]]; then
  die "RUSTFLAGS and CARGO_ENCODED_RUSTFLAGS must be unset"
fi

if ! $dry_run; then
  [[ "$(uname -s)" == "Linux" ]] || die "PGO release builds require Linux"
  [[ "$(uname -m)" == "x86_64" ]] || die "PGO release builds require x86_64"
fi

readonly WORK_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rsvelte-check-pgo.XXXXXXXX")"
readonly GENERATE_TARGET_DIR="$WORK_ROOT/target-generate"
readonly USE_TARGET_DIR="$WORK_ROOT/target-use"
readonly PROFILE_DIR="$WORK_ROOT/profiles"
readonly TRAINING_WORKSPACE="$WORK_ROOT/training-workspace"
readonly MERGED_PROFILE="$WORK_ROOT/merged.profdata"
readonly CORPUS_MANIFEST="$WORK_ROOT/corpus.sha256"

cleanup() {
  rm -rf -- "$WORK_ROOT"
}
trap cleanup EXIT

mkdir -p "$GENERATE_TARGET_DIR" "$USE_TARGET_DIR" "$PROFILE_DIR" "$TRAINING_WORKSPACE"

run() {
  printf '+'
  printf ' %q' "$@"
  printf '\n'
  if ! $dry_run; then
    "$@"
  fi
}

remove_work_dir() {
  local path="$1"
  [[ "$path" == "$WORK_ROOT/"* ]] || die "refusing to remove path outside PGO work root: $path"
  run rm -rf -- "$path"
}

hash_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    die "sha256sum or shasum is required"
  fi
}

shopt -s nullglob
corpus_files=("$CORPUS_DIR"/*.svelte)
shopt -u nullglob
(( ${#corpus_files[@]} > 0 )) || die "benchmark corpus contains no .svelte files"

for source in "${corpus_files[@]}"; do
  printf '%s  %s\n' "$(hash_file "$source")" "$(basename -- "$source")" >> "$CORPUS_MANIFEST"
done
readonly CORPUS_HASH="$(hash_file "$CORPUS_MANIFEST")"

for (( replica = 0; replica < TRAINING_REPLICAS; replica++ )); do
  printf -v replica_dir '%s/replica-%04d' "$TRAINING_WORKSPACE" "$replica"
  mkdir -p "$replica_dir"
  cp "${corpus_files[@]}" "$replica_dir/"
done
readonly TRAINING_FILE_COUNT=$(( ${#corpus_files[@]} * TRAINING_REPLICAS ))

readonly RUST_HOST="$(rustc -vV | sed -n 's/^host: //p')"
readonly RUST_SYSROOT="$(rustc --print sysroot)"
readonly LLVM_PROFDATA="$RUST_SYSROOT/lib/rustlib/$RUST_HOST/bin/llvm-profdata"
if ! $dry_run; then
  [[ "$RUST_HOST" == "$TARGET" ]] || die "Rust host must be $TARGET, got $RUST_HOST"
  [[ -x "$LLVM_PROFDATA" ]] || die "llvm-profdata is missing; install llvm-tools-preview"
fi

readonly CARGO_BUILD=(
  cargo build
  --profile "$PROFILE"
  -p rsvelte_check
  --bin svelte_check
  --target "$TARGET"
)
readonly GENERATE_FLAGS="-Cprofile-generate=$PROFILE_DIR"
readonly USE_FLAGS="-Cprofile-use=$MERGED_PROFILE"$'\x1f'"-Cllvm-args=-pgo-warn-missing-function"
readonly INSTRUMENTED_BINARY="$GENERATE_TARGET_DIR/$TARGET/$PROFILE/svelte_check"
readonly OPTIMIZED_BINARY="$USE_TARGET_DIR/$TARGET/$PROFILE/svelte_check"

cd "$REPO_ROOT"
run env \
  "CARGO_TARGET_DIR=$GENERATE_TARGET_DIR" \
  "CARGO_ENCODED_RUSTFLAGS=$GENERATE_FLAGS" \
  "${CARGO_BUILD[@]}"

for (( pass = 1; pass <= TRAINING_PASSES; pass++ )); do
  remove_work_dir "$TRAINING_WORKSPACE/.svelte-check"
  if $dry_run; then
    printf '+ LLVM_PROFILE_FILE=%q %q' "$PROFILE_DIR/svelte-check-%m-%p.profraw" "$INSTRUMENTED_BINARY"
    printf ' %q' \
      --workspace "$TRAINING_WORKSPACE" \
      --emit-overlay \
      --no-type-check \
      --no-tsconfig \
      --output machine
    printf ' >/dev/null\n'
  else
    LLVM_PROFILE_FILE="$PROFILE_DIR/svelte-check-%m-%p.profraw" \
      "$INSTRUMENTED_BINARY" \
      --workspace "$TRAINING_WORKSPACE" \
      --emit-overlay \
      --no-type-check \
      --no-tsconfig \
      --output machine \
      >/dev/null
  fi
done

if $dry_run; then
  profraw_files=("$PROFILE_DIR/svelte-check-<module>-<pid>.profraw")
else
  shopt -s nullglob
  profraw_files=("$PROFILE_DIR"/*.profraw)
  shopt -u nullglob
  (( ${#profraw_files[@]} > 0 )) || die "instrumented training produced no .profraw files"
fi

run "$LLVM_PROFDATA" merge --output "$MERGED_PROFILE" "${profraw_files[@]}"
remove_work_dir "$GENERATE_TARGET_DIR"
if ! $dry_run && [[ -e "$GENERATE_TARGET_DIR" ]]; then
  die "generation target was not removed before the profile-use build"
fi

run env \
  "CARGO_TARGET_DIR=$USE_TARGET_DIR" \
  "CARGO_ENCODED_RUSTFLAGS=$USE_FLAGS" \
  "${CARGO_BUILD[@]}"

run mkdir -p "$(dirname -- "$OUTPUT_PATH")"
run cp "$OPTIMIZED_BINARY" "$OUTPUT_PATH"
run chmod 755 "$OUTPUT_PATH"

if ! $dry_run && [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  llvm_profdata_version="$("$LLVM_PROFDATA" --version)"
  llvm_profdata_version="${llvm_profdata_version%%$'\n'*}"
  {
    echo "### svelte-check PGO build"
    echo
    echo "- Target: \`$TARGET\`"
    echo "- Profile: \`$PROFILE\`"
    echo "- Rust: \`$(rustc --version)\`"
    echo "- Cargo: \`$(cargo --version)\`"
    echo "- llvm-profdata: \`$llvm_profdata_version\`"
    echo "- Corpus SHA-256: \`$CORPUS_HASH\`"
    echo "- Training inputs: $TRAINING_FILE_COUNT files (${#corpus_files[@]} sources × $TRAINING_REPLICAS replicas)"
    echo "- Training passes: $TRAINING_PASSES"
  } >> "$GITHUB_STEP_SUMMARY"
fi
