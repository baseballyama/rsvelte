#!/bin/bash
# CI 完了待機スクリプト
# 指定された PR の CI チェックが全て完了するまでポーリングする。
# macOS 標準コマンド（gh, sleep）のみ使用。
#
# Usage: bash wait-ci.sh <owner> <repo> <pr_number>
# Exit codes:
#   0 - CI が全てパス
#   1 - CI に失敗あり（stdout に FAILED + 失敗ジョブ一覧を出力）
#   2 - 連続 API エラー（stdout に API_ERROR を出力）
#   3 - タイムアウト（stdout に TIMEOUT を出力）

set -euo pipefail

OWNER="${1:?Usage: wait-ci.sh <owner> <repo> <pr_number>}"
REPO="${2:?}"
PR="${3:?}"

POLL_INTERVAL=30
MAX_CONSECUTIVE_ERRORS=3
MAX_WAIT_SECONDS=1200 # 20分
consecutive_errors=0
elapsed=0

while true; do
  if [ "$elapsed" -ge "$MAX_WAIT_SECONDS" ]; then
    echo "TIMEOUT"
    exit 3
  fi

  sleep "$POLL_INTERVAL"
  elapsed=$((elapsed + POLL_INTERVAL))

  # CI チェック一覧を取得
  # gh pr checks は pending (exit 8) や fail (exit 1) で非ゼロを返すので、出力をキャプチャしつつ exit code を別途取得
  CHECK_EXIT=0
  CHECKS=$(gh pr checks "$PR" --repo "${OWNER}/${REPO}" 2>&1) || CHECK_EXIT=$?

  # 出力が空 = API エラー（非ゼロ exit code かつ出力なしの場合のみエラー扱い）
  if [ -z "$CHECKS" ]; then
    consecutive_errors=$((consecutive_errors + 1))
    if [ "$consecutive_errors" -ge "$MAX_CONSECUTIVE_ERRORS" ]; then
      echo "API_ERROR"
      exit 2
    fi
    continue
  fi
  consecutive_errors=0

  # "pending" or "skipping" 以外の未完了チェックがあるか確認
  # gh pr checks の出力: <name>\t<status>\t<duration>\t<url>
  HAS_PENDING=false
  HAS_FAIL=false
  FAILED_JOBS=""

  while IFS=$'\t' read -r name status _duration _url; do
    case "$status" in
      pass|skipping)
        ;;
      fail)
        HAS_FAIL=true
        FAILED_JOBS="${FAILED_JOBS}${name}\n"
        ;;
      *)
        HAS_PENDING=true
        ;;
    esac
  done <<< "$CHECKS"

  if [ "$HAS_PENDING" = true ]; then
    # まだ実行中のチェックがある
    continue
  fi

  if [ "$HAS_FAIL" = true ]; then
    echo "FAILED"
    printf '%b' "$FAILED_JOBS"
    exit 1
  fi

  # 全てパス
  echo "ALL_PASSED"
  exit 0
done
