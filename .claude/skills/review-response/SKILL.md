---
name: review-response
description: GitHub PR のコードレビューコメントに対応する。未 resolve のみを抽出 → 対応方針をユーザー承認 → 1 件ずつ修正＋返信 → AI レビュー由来の指摘はナレッジに反映するワークフロー。「/review-response [PR番号]」「レビュー対応」「レビューに返信」などの依頼時に使用。
argument-hint: "[pr-number]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Skill
---

# Review Response — GitHub PR レビュー対応

## 原則

| 原則 | 内容 |
|---|---|
| 未 resolve のみ | resolve 済みスレッドは対象外 |
| 1 件ずつ | 修正 → コミット → 返信を 1 件ごとに完結（バッチ対応しない） |
| 必ず返信 | 対応コミットハッシュを含める。変更不要でも理由を明記して返信 |
| 言語を合わせる | 指摘者の言語（英語 / 日本語）で返信。OSS なので英語が多い |
| 全件取得 | スレッドが 100 件超なら `pageInfo` でページング |

## ワークフロー

### 0. 未 resolve スレッドを取得

GraphQL を使う（REST は resolve 状態を返さない）。

```bash
PR_NUMBER="${1:-$(gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number')}"
REPO_INFO=$(gh repo view --json owner,name --jq '"\(.owner.login)|\(.name)"')
OWNER="${REPO_INFO%|*}"; REPO="${REPO_INFO#*|}"

gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id isResolved path line
            comments(first: 20) { nodes { databaseId body author { login } url } }
          }
        }
      }
    }
  }
' -f owner="$OWNER" -f repo="$REPO" -F pr="$PR_NUMBER"
```

### 1. 対応方針をユーザーに提示し、承認を得る（必須）

コード修正・返信の前に、各コメントを現在のコードで検証して表で提示する。

| # | ファイル | 指摘（要約） | 判定 | 対応方針 |
|---|---|---|---|---|
| 1 | path/to/file.rs:L42 | … | **要修正** / **対応不要** | 修正内容 or 不要と判断した理由 |

- **要修正**: 指摘が正しく、コード修正が必要
- **対応不要**: 現在のコードに該当しない（修正済み・削除済み）、または指摘が技術的に誤り

**承認を得てから次へ進む。** ユーザーが方針を変えたらそれに従う。

### 2. 1 件ずつ修正 → コミット → push

```bash
cargo fmt --all
cargo clippy --all-targets --all-features -- -D warnings
cargo test --release --test <関連スイート>

git add <修正ファイル>
git commit -m "fix(<scope>): <要約>"   # 英語の Conventional Commits
git push origin HEAD
```

pre-commit hook（`cargo fmt && cargo clippy`）を必ず通す。

### 3. スレッドに返信

```bash
gh api "repos/${OWNER}/${REPO}/pulls/${PR_NUMBER}/comments/${COMMENT_ID}/replies" -f body="返信内容"
```

`COMMENT_ID` は GraphQL の `databaseId`。

### 4. ナレッジフィードバック（AI ボットの指摘のみ）

投稿者が `coderabbitai[bot]` / `devin-ai-integration[bot]` / `chatgpt-codex-connector[bot]` / `claude[bot]` 等の場合、対応後に実施する。

| 判定 | やること |
|---|---|
| 要修正だった | `.claude/skills/*/SKILL.md`（`full-code-review`, `verify-svelte-compat`, `perf-loop` など）と `docs/` を横断検索。未記載なら最も近いスキルか `docs/` に 1〜3 行で追記。記載済みなら記述が不明確でないか見直す |
| 対応不要だった | 「これは問題ない」文脈（公式 Svelte と意図的に異なる挙動、Rust 固有の最適化など）を該当スキルか `compatibility/GATES.md` の該当節に追記 |

`CLAUDE.md`（= `AGENTS.md`）は全セッションに読み込まれるため、追記は「短く・一般的で・実害があった規則」に限る（同ファイルの Maintaining This File 参照）。事例や数値は書かない。

追記・改善は **ユーザーに確認してから** 行い、結果を報告する。

## 返信テンプレート

修正した場合（英語）:

```markdown
Thanks for the catch!

[summary of the fix]

Fixed in: abc1234
```

変更不要の場合（英語）:

```markdown
Thanks for the review!

[reasoning for keeping the current implementation]

- [reason 1]
- [link to spec / official Svelte source if relevant]

I'll keep the current implementation for the reasons above.
```

日本語の指摘には同じ構成で「ご指摘ありがとうございます！ … 対応コミット: abc1234」/「… 上記の理由から、現状の実装を維持させていただきます。」と返す。

公式 Svelte と意図的に挙動を変えている箇所は、その旨と根拠（例: `CLAUDE.md` → "Memory-efficient layout (u32 positions, compact_str)"）を返信に明記する。
