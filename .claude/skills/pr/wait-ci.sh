#!/bin/bash
# Wait for the CI checks of one PR.
# Fail fast: print FAILED as soon as one check fails, even if others still run.
# Needs: gh (logged in).
#
# Usage: bash .claude/skills/pr/wait-ci.sh <owner> <repo> <pr_number>
# Exit codes:
#   0 - ALL_PASSED: every check passed or was skipped (and there is at least one check)
#   1 - FAILED: one or more checks failed or were cancelled (names follow on stdout)
#   2 - API_ERROR: gh failed several times in a row (its output follows on stdout)
#   3 - TIMEOUT: still running after MAX_WAIT_SECONDS; run the script again

set -euo pipefail

OWNER="${1:?Usage: wait-ci.sh <owner> <repo> <pr_number>}"
REPO="${2:?}"
PR="${3:?}"

POLL_INTERVAL=30
MAX_CONSECUTIVE_ERRORS=3
MAX_WAIT_SECONDS=540 # shorter than a 10 minute tool timeout, so TIMEOUT is always printed
consecutive_errors=0
SECONDS=0

while true; do
  if [ "$SECONDS" -ge "$MAX_WAIT_SECONDS" ]; then
    echo "TIMEOUT"
    exit 3
  fi

  sleep "$POLL_INTERVAL"

  # gh pr checks exit codes: 0 = all passed, 1 = some failed (or a general gh error), 8 = pending.
  CHECK_EXIT=0
  CHECKS=$(gh pr checks "$PR" --repo "${OWNER}/${REPO}" 2>&1) || CHECK_EXIT=$?

  # A general gh error has no tab-separated check rows. Count it as an API error, not as pending,
  # or the loop would only ever end in TIMEOUT.
  if { [ "$CHECK_EXIT" -ne 0 ] && [ "$CHECK_EXIT" -ne 1 ] && [ "$CHECK_EXIT" -ne 8 ]; } ||
    ! printf '%s' "$CHECKS" | grep -q "$(printf '\t')"; then
    consecutive_errors=$((consecutive_errors + 1))
    if [ "$consecutive_errors" -ge "$MAX_CONSECUTIVE_ERRORS" ]; then
      echo "API_ERROR"
      echo "$CHECKS"
      exit 2
    fi
    continue
  fi
  consecutive_errors=0

  # Row format: <name>\t<status>\t<duration>\t<url>
  HAS_PENDING=false
  HAS_FAIL=false
  FAILED_JOBS=""

  while IFS=$'\t' read -r name status _duration _url; do
    case "$status" in
      pass | skipping) ;;
      # A cancelled check is not a pass.
      fail | cancel)
        HAS_FAIL=true
        FAILED_JOBS="${FAILED_JOBS}${name} (${status})\n"
        ;;
      *) HAS_PENDING=true ;;
    esac
  done <<<"$CHECKS"

  if [ "$HAS_FAIL" = true ]; then
    echo "FAILED"
    printf '%b' "$FAILED_JOBS"
    exit 1
  fi

  if [ "$HAS_PENDING" = true ]; then
    continue
  fi

  echo "ALL_PASSED"
  exit 0
done
