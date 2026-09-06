---
name: ci-fix-and-verify
description: PR の CI 失敗を修正し、全 CI がパスするまでプッシュ→待機→修正を繰り返す。「/ci-fix-and-verify [PR番号]」「CI直して」「CIが落ちてる」「CI修正」などの依頼時に使用。
argument-hint: "[pr-number]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Skill
---

# CI Fix and Verify

PR の CI 失敗を検出・修正し、全チェックがパスするまでサイクルを回す。引数は PR 番号（省略時は現在ブランチから検出）。

## Phase 0: 初期化

```bash
PR_NUMBER="${1:-$(gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number')}"
REPO_INFO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')
OWNER="${REPO_INFO%/*}"; REPO="${REPO_INFO#*/}"
```

## Phase 1: CI 状態確認

```bash
gh pr checks "$PR_NUMBER" --repo "$OWNER/$REPO"
```

| 状態 | 次 |
|---|---|
| 全てパス | 完了報告して終了 |
| 失敗あり | Phase 2 |
| 実行中 | wait-ci.sh で待機してから再確認 |

## Phase 2: 失敗分析と修正

```bash
gh run view <run_id> --repo "$OWNER/$REPO" --log-failed
```

| 失敗タイプ | ローカル再現 / 修正 |
|---|---|
| fmt | `cargo fmt --all` |
| clippy | `cargo clippy --all-targets --all-features -- -D warnings` |
| ビルド | `cargo build --all-targets` |
| テスト | 失敗テストを CI ログから特定し `cargo test --release --test <suite>` で個別実行（フル実行は最後） |
| fixtures ずれ | `pnpm run generate-fixtures` 後に再テスト |
| docs / compatibility report | `pnpm run test-and-update` で再生成 |
| Node 側 | `pnpm install` 後、該当 `node scripts/...` の出力を確認 |

CI と同じコマンドで再現する。ワークフローは `.github/workflows/` を参照。

## Phase 3: プッシュと待機

```bash
cargo fmt --all
cargo clippy --all-targets --all-features -- -D warnings   # pre-commit hook と同じ

git add <修正ファイル>
git commit -m "fix(ci): <要約>"    # 英語 Conventional Commits、atomic commit
git push origin HEAD

# Bash tool の timeout は 600000（10分）に設定。最大 20 分待機
bash .claude/skills/ci-fix-and-verify/wait-ci.sh "$OWNER" "$REPO" "$PR_NUMBER"
```

| wait-ci.sh 出力 | アクション |
|---|---|
| `ALL_PASSED` | Phase 4 |
| `FAILED` | Phase 2 に戻る |
| `TIMEOUT` | `gh pr checks` を確認し、必要なら wait-ci.sh を再実行して待機延長 |
| `API_ERROR` | エラーを表示して終了 |

## Phase 4: 完了報告

```text
CI が全てパスしました！
- 修正回数: X回
- 修正内容: [修正ごとの要約]
```

## ルール

- 修正サイクルは最大 5 回。超えたらユーザーに状況を報告する
- `--no-verify` などのフック回避フラグは使わない
