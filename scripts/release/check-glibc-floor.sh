#!/usr/bin/env bash
# Fail when a Linux artifact we are about to publish needs a newer glibc than
# the floor we promise. The answer is read out of the binary, so a bump of the
# runner image cannot raise the requirement without this going red.
set -Eeuo pipefail

export LC_ALL=C

FLOOR="${GLIBC_FLOOR:-2.35}"

die() {
  echo "check-glibc-floor: $*" >&2
  exit 1
}

if [ "$#" -eq 0 ]; then
  die "usage: [GLIBC_FLOOR=x.y] $0 <artifact>..."
fi

case "$FLOOR" in
  [0-9]*.[0-9]*) ;;
  *) die "GLIBC_FLOOR must look like 2.35, got '$FLOOR'" ;;
esac

reader=
for candidate in readelf eu-readelf; do
  if command -v "$candidate" >/dev/null 2>&1; then
    reader="$candidate"
    break
  fi
done
[ -n "$reader" ] || die "readelf is required (install binutils)"

status=0

for artifact in "$@"; do
  [ -f "$artifact" ] || die "no such file: $artifact"

  # `head -c 4` rather than `file`, which is not installed on every image.
  magic=$(head -c 4 -- "$artifact" | od -An -tx1 | tr -d ' \n')
  [ "$magic" = "7f454c46" ] || die "not an ELF object: $artifact"

  # Both sections name the requirement: `--version-info` lists what the
  # `.gnu.version_r` entries ask for, `--dyn-syms` the per-symbol `@GLIBC_*`
  # suffixes. Reading both means a stripped-down layout still answers.
  versions=$(
    "$reader" --dyn-syms --version-info -W -- "$artifact" 2>/dev/null |
      grep -o 'GLIBC_[0-9][0-9.]*' |
      sed -e 's/^GLIBC_//' -e 's/\.$//' |
      sort -uV || true
  )

  if [ -z "$versions" ]; then
    echo "ok   $artifact — no versioned glibc symbols"
    continue
  fi

  highest=$(printf '%s\n' "$versions" | tail -1)
  if [ "$(printf '%s\n%s\n' "$FLOOR" "$highest" | sort -V | tail -1)" = "$FLOOR" ]; then
    echo "ok   $artifact — needs glibc $highest (floor $FLOOR)"
  else
    echo "FAIL $artifact — needs glibc $highest, above the floor $FLOOR" >&2
    echo "     versions referenced: $(printf '%s' "$versions" | tr '\n' ' ')" >&2
    status=1
  fi
done

exit "$status"
