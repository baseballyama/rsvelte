---
name: ci-fix-and-verify
description: PR の CI 失敗を修正し、全 CI がパスするまでプッシュ→待機→修正を繰り返す。「/ci-fix-and-verify [PR番号]」「CI直して」「CIが落ちてる」「CI修正」などの依頼時に使用。
argument-hint: "[pr-number]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Skill
---

# CI Fix and Verify スキル

PR の CI 失敗を検出・修正し、全 CI チェックがパスするまで自動的にサイクルを回す。

## 使い方

```bash
/ci-fix-and-verify [PR番号]
```

引数として PR 番号を受け取る。省略時は現在のブランチに紐づく PR を自動検出する。

## ワークフロー

### Phase 0: 初期化

現在のブランチの PR を特定する。

```bash
# 引数がない場合、現在のブランチから PR を検出
CURRENT_BRANCH=$(git branch --show-current)
PR_NUMBER=$(gh pr list --head "$CURRENT_BRANCH" --json number --jq '.[0].number')

# PR の owner/repo を取得
REPO_INFO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')
OWNER=$(echo "$REPO_INFO" | cut -d'/' -f1)
REPO=$(echo "$REPO_INFO" | cut -d'/' -f2)
```

### Phase 1: CI 状態確認

```bash
gh pr checks "$PR_NUMBER" --repo "$OWNER/$REPO"
```

- 全てパスしている場合 → 完了メッセージを出力して終了
- 失敗がある場合 → Phase 2 へ
- まだ実行中の場合 → wait-ci.sh で待機してから再確認

### Phase 2: 失敗分析と修正

失敗した各ジョブのログを取得して分析する。

```bash
# 失敗ジョブのログを取得
gh run view <run_id> --repo "$OWNER/$REPO" --log-failed
```

失敗の種類に応じて修正:

| 失敗タイプ      | 修正方法                                                                             |
| --------------- | ------------------------------------------------------------------------------------ |
| fmt エラー      | `cargo fmt --all` を実行                                                             |
| clippy エラー   | `cargo clippy --all-targets --all-features -- -D warnings` の出力を見て修正          |
| ビルドエラー    | `cargo build --all-targets` の出力を見て修正                                         |
| テスト失敗      | 該当する `cargo test --test <suite>` を実行し、テストコード or 実装コードを修正      |
| fixtures ずれ   | `pnpm run generate-fixtures` を再実行してから再度テスト                              |
| docs / report   | `pnpm run test-and-update` でドキュメントを再生成                                    |
| Node 側エラー   | `pnpm install` で依存解決、`node scripts/...` の出力を確認                           |

ローカルでは可能な限り **CI と同じコマンド** を流して再現させる。CI ワークフローは `.github/workflows/` を参照。

### Phase 3: プッシュと待機

修正をコミットしてプッシュし、CI の完了を待つ。

```bash
# pre-commit hook で fmt / clippy が走るので、必ず通してからコミット
cargo fmt --all
cargo clippy --all-targets --all-features -- -D warnings

# 変更をコミット（atomic commit、英語の Conventional Commits）
git add <修正ファイル>
git commit -m "fix(ci): <修正内容の要約>"

# プッシュ
git push origin HEAD

# CI 完了まで待機（最大20分）
bash .claude/skills/ci-fix-and-verify/wait-ci.sh "$OWNER" "$REPO" "$PR_NUMBER"
```

**wait-ci.sh の出力に応じた分岐**:

| 出力         | アクション                                             |
| ------------ | ------------------------------------------------------ |
| `ALL_PASSED` | Phase 4 へ（成功）                                     |
| `FAILED`     | Phase 2 に戻って再修正                                 |
| `TIMEOUT`    | 手動で `gh pr checks` を確認し、状況に応じて待機を延長 |
| `API_ERROR`  | エラーメッセージを表示して終了                         |

### Phase 4: 完了報告

```text
CI が全てパスしました！
- 修正回数: X回
- 修正内容:
  - [修正1の要約]
  - [修正2の要約]
```

## 注意事項

- 修正のたびに **ローカルで** 以下を必ず実行する（pre-commit hook と同じ）:
  - `cargo fmt --all`
  - `cargo clippy --all-targets --all-features -- -D warnings`
  - 関連するテストスイート（最低限 `cargo test --release`）
- 最大 5 回まで修正サイクルを回す（無限ループ防止）。それを超えても直らない場合はユーザーに状況を報告する。
- CI 待機は wait-ci.sh を使い、Bash tool の `timeout` を `600000`（10分）に設定する
- タイムアウト時は再度 wait-ci.sh を実行して待機を延長する
- `cargo test` をフルで流すと時間がかかるため、CI ログから失敗テストを特定して個別実行を優先する
- 互換性レポート系の差分の場合は `pnpm run test-and-update` でドキュメントを再生成すること
- `--no-verify` などのフック回避フラグは使わない
