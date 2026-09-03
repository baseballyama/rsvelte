#!/usr/bin/env bash
# Fail before a shipped build if pgo/rsvelte.profdata would not actually be applied.
#
# rustc treats the two failure modes differently, and only one of them is loud:
# a *missing* `-Cprofile-use` path is a hard error, while a *corrupt* one — a
# truncated checkout, an LFS pointer, a bad merge — is a warning, and the build
# then succeeds and ships a binary with no profile applied at all. That is a
# failure whose output is shaped exactly like success, so it is asserted here
# rather than left to be noticed in a benchmark months later.
set -euo pipefail

PROFILE=${1:-pgo/rsvelte.profdata}
[ -s "$PROFILE" ] || { echo "::error::$PROFILE is missing or empty" >&2; exit 1; }

# The 8-byte magic of an indexed LLVM profile, little-endian "\xffLPROFI\x81".
MAGIC=$(head -c 8 "$PROFILE" | od -An -tx1 | tr -d ' \n')
[ "$MAGIC" = "ff6c70726f666981" ] || {
  echo "::error::$PROFILE is not an indexed LLVM profile (magic $MAGIC)" >&2
  exit 1
}
echo "PGO profile ok: $PROFILE ($(wc -c < "$PROFILE" | tr -d ' ') bytes)"
