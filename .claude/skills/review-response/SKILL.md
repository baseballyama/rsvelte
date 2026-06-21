---
name: review-response
description: GitHub PR のコードレビューコメントに対応する。未 resolve のみを抽出 → 対応方針をユーザー承認 → 1 件ずつ修正＋返信 → AI レビュー由来の指摘はナレッジに反映するワークフロー。「/review-response [PR番号]」「レビュー対応」「レビューに返信」などの依頼時に使用。
argument-hint: "[pr-number]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Skill
---

# Review Response — GitHub PR レビュー対応スキル

GitHub PR でレビューコメントを受け取った際の対応手順。

- [対応の基本原則](#対応の基本原則)
- [対応ワークフロー](#対応ワークフロー)
  - [0. レビューコメントを全件取得する](#0-レビューコメントを全件取得する)
  - [1. 対応方針をユーザーに確認する（必須）](#1-対応方針をユーザーに確認する必須)
  - [2. コメントを 1 つずつ対応](#2-コメントを-1-つずつ対応)
  - [3. コードを修正してコミット](#3-コードを修正してコミット)
  - [4. GitHub コメントに返信](#4-github-コメントに返信)
  - [5. ナレッジフィードバック（AI レビューコメントの場合）](#5-ナレッジフィードバックai-レビューコメントの場合)
- [返信のフォーマット](#返信のフォーマット)
- [GitHub API でコメント返信](#github-api-でコメント返信)
- [対応例](#対応例)

## 対応の基本原則

| 原則                   | 内容                                               |
| ---------------------- | -------------------------------------------------- |
| 未 resolve に着目      | resolve 済みは対応不要。未 resolve のみ対応        |
| 1 つずつ対応           | 複数コメントがあっても 1 つずつ順番に対応          |
| 必ず返信               | 対応したら必ずそのコメントに返信（スレッド形式）   |
| コミットハッシュを記載 | 返信には対応したコミットハッシュを必ず含める       |
| 変更不要でも説明       | 変更しない場合も、なぜ不要なのか理由を明記して返信 |
| ページングで全件確認   | コメントが多い場合、API のページングで全件取得する |

## 対応ワークフロー

### 0. レビューコメントを全件取得する

未 resolve のレビュースレッドのみを GraphQL で取得する（REST API では resolve 状態が取れない）。

```bash
# 引数から PR 番号を取得（省略時は現在ブランチから）
PR_NUMBER="${1:-$(gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number')}"

# owner/repo
REPO_INFO=$(gh repo view --json owner,name --jq '"\(.owner.login)|\(.name)"')
OWNER="${REPO_INFO%|*}"
REPO="${REPO_INFO#*|}"

# 未 resolve のレビュースレッドを取得
gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100) {
          nodes {
            id
            isResolved
            path
            line
            comments(first: 20) {
              nodes {
                databaseId
                body
                author { login }
                url
              }
            }
          }
        }
      }
    }
  }
' -f owner="$OWNER" -f repo="$REPO" -F pr="$PR_NUMBER"
```

スレッド数が 100 を超える場合は `pageInfo` を使ってページングする。

### 1. 対応方針をユーザーに確認する（必須）

**コードの修正やコメントへの返信を行う前に、必ずこのステップを実行すること。**

未 resolve のコメントを全件取得したら、各コメントについて現在のコードを読んで検証し、以下の情報を表形式でユーザーに提示する：

| #   | ファイル            | 指摘内容（要約） | 判定                      | 対応方針                               |
| --- | ------------------- | ---------------- | ------------------------- | -------------------------------------- |
| 1   | path/to/file.rs:L42 | 指摘の要約       | **要修正** / **対応不要** | 具体的な修正内容 or 不要と判断した理由 |

判定の基準：

- **要修正**: 指摘が正しく、コード修正が必要
- **対応不要**: 指摘が現在のコードに該当しない（既に修正済み、コード削除済み等）、または指摘内容が技術的に誤り

**ユーザーの承認を得てから、次のステップに進むこと。** ユーザーが方針を修正した場合はそれに従う。

### 2. コメントを 1 つずつ対応

ユーザーの承認後、未 resolve のコメントのみを対象に 1 つずつ順番に対応する。これにより：

- 各コメントへの対応が明確になる
- コミット履歴が追跡しやすくなる
- レビュアーが確認しやすくなる

### 3. コードを修正してコミット

各コメントに対応したら、その変更をコミットする。

- pre-commit hook（`cargo fmt && cargo clippy`）を必ず通す
- コミットメッセージは英語の Conventional Commits（`fix:`, `refactor:`, `perf:` など）
- 関連するテストスイートをローカルで実行してから push

```bash
cargo fmt --all
cargo clippy --all-targets --all-features -- -D warnings
cargo test --release --test <関連スイート>

git add <修正ファイル>
git commit -m "fix(<scope>): <変更内容の要約>"
git push origin HEAD
```

### 4. GitHub コメントに返信

コミット後、GitHub コメントにスレッド形式で返信する（[返信のフォーマット](#返信のフォーマット)参照）。

### 5. ナレッジフィードバック（AI レビューコメントの場合）

レビューコメントの投稿者が AI ボット（`coderabbitai[bot]`、`devin-ai-integration[bot]`、`chatgpt-codex-connector[bot]`、`claude[bot]` など）の場合、対応後に以下のフィードバックループを実行する。

#### 要修正だった場合 → ナレッジへの反映を検討

指摘が正しく、実際にコード修正を行った場合：

1. 以下を横断検索し、同じパターンが既に記述されているか確認：
   - `CLAUDE.md`（プロジェクト全体の方針）
   - `.claude/skills/*/SKILL.md`（rsvelte 固有のスキル群: `full-code-review`, `verify-svelte-compat`, `perf` など）
2. **記述がない場合**: 最も適したスキルファイル or `CLAUDE.md` に新しいパターンとして追記する
3. **記述がある場合**: スキルに書いてあるのに指摘された理由を考える
   - スキルの記述が不明確 → 記述を改善
   - スキルのコード例が不足 → 例を追加
   - 特に問題なし → スキップ
4. 追記・改善した場合はユーザーに報告する

#### 対応不要だった場合 → 再発防止

指摘が的外れで、変更不要と判断した場合：

1. 該当するスキルファイル or `CLAUDE.md` に「これは問題ない」という文脈を追記する
   - 例: 「公式 Svelte コンパイラと意図的に異なる挙動」「Rust 固有の最適化のため意図的にこの形」など
2. 追記した場合はユーザーに報告する

**注意**: スキル / `CLAUDE.md` の追記・改善はユーザーに確認してから行うこと。

## 返信のフォーマット

返信は **指摘者の言語に合わせる**（日本語の指摘には日本語、英語の指摘には英語）。OSS なので英語が多い。

### コード修正を行った場合（英語）

```markdown
Thanks for the catch!

[summary of the fix]

Fixed in: abc1234
```

### 変更不要と判断した場合（英語）

```markdown
Thanks for the review!

[reasoning for keeping the current implementation]

- [reason 1]
- [reason 2]
- [link to spec / official Svelte source if relevant]

I'll keep the current implementation for the reasons above.
```

### コード修正を行った場合（日本語）

```markdown
ご指摘ありがとうございます！

[対応内容の説明]

対応コミット: abc1234
```

### 変更不要と判断した場合（日本語）

```markdown
ご指摘ありがとうございます！

[変更不要と判断した理由の説明]

- [根拠 1]
- [根拠 2]
- [必要に応じて参考リンクや仕様書への参照]

上記の理由から、現状の実装を維持させていただきます。
```

## GitHub API でコメント返信

```bash
# スレッド形式で返信（pull request review comment への reply）
gh api "repos/${OWNER}/${REPO}/pulls/${PR_NUMBER}/comments/${COMMENT_ID}/replies" \
  -f body="返信内容"
```

`COMMENT_ID` は GraphQL で取得した `databaseId` を使う。

## 対応例

### 修正対応の例

**レビューコメント** (`coderabbitai[bot]`):

> The `unwrap()` on line 42 will panic if the iterator is empty. Consider using `unwrap_or_default()` or handling the error explicitly.

**返信**:

```markdown
Good catch — switched to `unwrap_or_default()` since an empty iterator is a valid state in this code path.

Fixed in: 7f8e9a1
```

**追加対応** (`unwrap_or_default` 系の指摘なので、ナレッジに同じパターンが既にあるか `CLAUDE.md` を確認 → なければユーザーに追記提案)

### 変更不要の場合の例

**レビューコメント**:

> Why use `compact_str` instead of `String` here?

**返信**:

```markdown
This matches the official Svelte compiler's intent of keeping symbol names compact in memory. `CompactString` inlines small strings (≤24 bytes) without heap allocation, which is the common case for Svelte identifiers.

See `CLAUDE.md` → "Memory-efficient layout (u32 positions, compact_str)".

Keeping the current implementation.
```

## 注意事項

- 指摘者の言語（英語/日本語）に合わせて返信する
- 必ず未 resolve のスレッドのみを対象にする
- 1 件ずつ対応＋コミット＋返信（バッチで対応すると追跡が困難）
- AI ボットからの指摘は「ナレッジ反映が必要か」を毎回検討する
- 公式 Svelte と意図的に挙動を変えている箇所は、その旨を明記して返信する
