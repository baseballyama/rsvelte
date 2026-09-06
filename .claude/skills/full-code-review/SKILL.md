---
name: full-code-review
description: PR 提出前にコードオーナー視点でフルレビューする。WHY の理解 → 設計 → AST/基盤型 → 実装（複数 Agent の順次レビュー）の順に、各フェーズでユーザーと対話しながら指摘を修正し、品質に問題がなくなるまで繰り返す。「/full-code-review」「フルレビュー」「レビューして」などの依頼時に使用。rsvelte（公式 Svelte コンパイラの Rust ポート）専用。
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Skill, WebSearch, WebFetch
effort: max
---

# Full Code Review（rsvelte 版）

PR 提出前にコードオーナー視点でフルレビューし、各フェーズで結果を提示 → 対話で修正 → 指摘ゼロまで反復する。

## 前提

- rsvelte は公式 Svelte コンパイラ（`submodules/svelte/packages/svelte/src/compiler/`）の Rust ポート。ゴールは **100% テスト互換 / 100x 性能 / OXC 統合**。最重要観点は「公式実装との一致」と「hot path の性能」。
- 対象はブランチ上の変更 or PR 番号。ユーザーがコードオーナーで最終判断者。修正は承認後に行い、各フェーズの問題はそのフェーズで解決する。性能は `./scripts/bench/bench.sh` の数値で議論し、`unwrap()` の False Positive（テストコード / 正当性が証明された箇所）に注意する。
- 重要度: **Critical** = 公式と挙動が異なりテスト失敗 / メモリ安全性違反 / 計測可能な性能退行（必ず修正、Approve 不可）。**Major** = 公式と構造が乖離（追従コスト増）/ 性能低下リスク / テスト不足（原則修正、正当な理由でスキップ可）。**Minor** = 命名・コメント・微小な可読性（推奨）。

## Step 0: 差分の把握

**ベースブランチ**（優先順）: ①ユーザー指定 → ②PR 番号あり: `origin/$(gh pr view <N> --json baseRefName -q .baseRefName)` → ③`origin/main`・`origin/master`・`origin/develop` のうち存在して HEAD との差分行数が最小のもの（`git fetch origin` 済みの `origin/` を使う）。決定したベースを報告し、以降の `git diff` はすべてこれを基準にする。

```bash
git diff --name-only ${BASE_BRANCH}...HEAD
git diff --stat ${BASE_BRANCH}...HEAD
git log --oneline ${BASE_BRANCH}...HEAD
```

変更ファイルを分類して規模とともに報告（PR 番号があれば説明欄も提示）:

| カテゴリ | パス |
|---|---|
| AST/基盤型 | `crates/rsvelte_core/src/ast/` |
| Parse / Analyze / Transform | `crates/rsvelte_core/src/compiler/phases/{1_parse,2_analyze,3_transform}/` |
| Error | `crates/rsvelte_core/src/error/` |
| NAPI / バイナリ | `crates/rsvelte_napi/`、`crates/rsvelte_core/src/{lib.rs,bin/}`、`apps/npm/` |
| テスト | `tests/`、`benches/`、`examples/` |
| インフラ | `.github/`、`scripts/`、`build.rs`、`Cargo.*`、`package.json`、Docker 系 |
| ドキュメント | `*.md`、`docs/` |
| サブモジュール / fixture | `submodules/`、`fixtures/` — **レビュー対象外**（版が変わっていれば Phase 1 で報告） |

---

## Phase 1: WHY の理解と妥当性

**目的**: PR の動機（Svelte 新版追従 / テスト互換性向上 / 性能改善 / バグ修正 / リファクタ / 新構文対応 / DX・インフラ）を明確にし、存在意義が妥当か判断する。動機別の観点: 追従→公式差分を正確に追えているか、性能→ベンチ数値の根拠、バグ修正→根本原因 vs 対症療法、リファクタ→意味のある簡素化か、新構文→公式をミラーしているか。

**手順**:
1. `gh pr view`（タイトル・説明・コメント・Issue）、コミットメッセージ、差分から意図と性質を把握。サブモジュール更新があれば新旧版と changelog を確認。
2. WHY が読み取れなければユーザーに質問（背景 / 影響範囲: 互換性・性能・公開 API / 対応する公式 commit・PR・issue）。読み取れれば理解内容を提示して確認を求める。
3. 妥当性を評価: 公式との整合（意図的逸脱なら理由）/ テスト pass 数の増減（`pnpm run compatibility-report`）/ hot path 影響と計測有無 / 過剰実装でないか。

**報告**:

```
## Phase 1: WHY の理解と妥当性
### WHY の理解
- 背景 / 解決する問題 / 公式実装の対応箇所（submodules/svelte/.../compiler/<path> or 「該当なし」）/ 想定インパクト（テスト X→Y、ベンチ X→Y、API 変更）
### 妥当性の判断
- 判定: 妥当 / 懸念あり / 要議論 — 理由
### 懸念事項（あれば）
```

妥当なら承認不要で Phase 2 へ。懸念があれば提示してユーザーの回答を待つ。

---

## Phase 2: 全体設計レビュー

**確認事項**:

1. **公式実装との整合（最重要）**: 同じアルゴリズム・責務分割か / ディレクトリ・ファイル・関数名がミラーか / 独自抽象を追加していないか / サブモジュール最新版との差が広がっていないか
2. **パイプラインの一貫性**: `1_parse → 2_analyze → 3_transform` のデータフロー / フェーズ間で AST を直接渡しているか（再パースしていないか）/ 概念の重複定義 / エラー・警告型が `error/` に集約されているか
3. **AST / 基盤型への影響**: `ast/` 変更があれば Phase 3 で集中レビューすると予告 / 下流（analyze・transform・tests）への伝播 / 新バリアントが全 visitor・matcher・transform で扱われているか
4. **性能の構造的影響**: hot path（パース・トラバーサル・codegen）への新規割り当て・clone / `serde_json::Value` の増加 / `'a` 借用の維持 / `Vec`・`HashMap`・`Box` に対する `SmallVec`・`FxHashMap`・arena の検討 / `./scripts/bench/bench.sh --quick` での計測
5. **複雑性**: 不要な trait 階層・ジェネリクス・マクロ / YAGNI / 「シンプルなデータ構造にシンプルなコード」（`/perf-loop` 参照）
6. **NAPI / 公開境界**: 破壊的変更の有無 / 公式コンパイラ API との互換 / vite-plugin-svelte 等の consumer から見える挙動

**報告**:

```
## Phase 2: 全体設計レビュー
### 設計の概要
### 評価
| 観点（公式整合性 / パイプライン一貫性 / AST・基盤型 / 性能（構造）/ 複雑性 / NAPI・公開境界） | OK / 要改善 / N/A | コメント |
### 指摘事項
1. **[Critical/Major/Minor]** [内容] → [改善案]
→ 指摘事項を対応しますか？それとも Phase 3 に進みますか？
```

**ユーザーの承認を待ってから Phase 3 へ。**

---

## Phase 3: AST・基盤型レビュー

**対象**: `crates/rsvelte_core/src/ast/`（変更がなければスキップ）— `mod.rs` / `template.rs`（テンプレート AST）/ `js.rs`（JS 式・文）/ `typed_expr.rs`（`JsNode`）/ `css.rs` / `span.rs`（u32 位置）/ `arena.rs`。全フェーズが依存し変更コストが最大なので最も慎重に見る。

**確認事項**:

1. **公式 AST との一致**: kind 文字列（`"IfBlock"` 等）・フィールド名・必須/オプショナル / 独自フィールドの有無（要理由）/ 公式の新 kind に対応するバリアント
2. **メモリレイアウト**: 位置は `u32`（`usize` 不可）/ 文字列型（ソース借用→`&'a str`、頻出→`Atom<'a>`、短い所有→`CompactString`、大きい所有→`String`）/ `Box`・`Vec` の arena 化余地 / 巨大バリアントは `Box`
3. **ライフタイム**: `'a` がソース/arena から一貫して引かれているか / 不要な `'static` / 既存 `'a` 設計との整合
4. **網羅性**: `match` がコンパイルエラーで検出できるか / 全 visitor（`walk_*`、`visit_*`）/ serializer に分岐が追加されているか
5. **命名**: 公式 JS 側との整合 / 短縮名禁止（`exp`→`expression`）/ Rust 慣習
6. **不変条件**: コンストラクタ or `Result` で保証 / `Option<T>` の意味が明確か
7. **下流への伝播**（1 つ欠けるとビルドエラー・テスト失敗）: `1_parse/` の生成 / `2_analyze/` の scope・binding / `3_transform/client/`・`server/`・`css/` / visitor・walker（複数箇所）/ `error/` / fixture 互換（`fixtures/`、自動生成）/ NAPI 公開 API
8. **設計判断**（自動で決めず、ユーザーに質問して見落としを防ぐ）:

| トリガー | ユーザーに確認すること |
|---|---|
| 新規文字列フィールド | ソースのスライスとして借用できるか（`&'a str`）/ 大量出現するか（`Atom<'a>`）/ 生成された短い文字列か（`CompactString`）/ 大きく可変か（`String`） |
| バリアント追加 / 新規 enum | 公式の対応型はどう表現しているか（最優先）/ 共通構造体 + タグ化で済むか / サイズが他の何倍か（巨大なら `Box`） |
| `String`/`Vec`/`Box` の導入 | 周囲の型は `'a` を引いているか（合わせる）/ 所有が必要な理由 / `'static` 前提の領域なら無理に `'a` 化しない |

**報告**:

```
## Phase 3: AST・基盤型レビュー
### 変更されたファイル
### 型別レビュー — `XxxNode`
| 観点（公式 AST との一致 / メモリレイアウト / ライフタイム / 網羅性 / 命名 / 下流への伝播 / 設計判断） | OK / 要改善 / 要対応 / N/A | コメント |
### 指摘事項
1. **[Critical/Major/Minor]** [ファイル:行] [内容] → [改善案]
→ 指摘事項を対応しますか？それとも Phase 4 に進みますか？
```

**ユーザーの承認を待ってから Phase 4 へ。**

---

## Phase 4: 実装レビュー（チャンク分割 → 順次 Agent → 対話 → 再レビュー）

**対象**: AST（Phase 3 済み）とサブモジュール・fixture 以外の全変更。一括で渡すと検知漏れ・出力打ち切りが起きるため、スクリプトで **チャンク** に分割し、Agent ごとにチャンク単位で「指摘ゼロまで」修正 → 再レビューを回す。

### Step 4-0: チャンク計画

Step 0 の `${BASE_BRANCH}` を必ず渡す（省略時はスクリプトが Step 0 と同じロジックで自動選択）:

```bash
node .claude/skills/full-code-review/scripts/plan-review-chunks.mjs --format=md ${BASE_BRANCH}   # ユーザー提示用
node .claude/skills/full-code-review/scripts/plan-review-chunks.mjs ${BASE_BRANCH} > /tmp/review-chunks.json   # 内部用
```

スクリプト: `git diff --numstat` → カテゴリ分類（ast / submodule / parse / analyze / transform / error / napi / tests / infra / docs / other_src / other）→ ast と submodule/fixture をスキップ → カテゴリ内でパス順、ディレクトリ境界 + 上限（500 行 / 10 ファイル）で分割 → 順序は parse → analyze → transform → error → napi → tests → other_src → infra → docs → other。分類は `crates/rsvelte_core/src/…` / `crates/rsvelte_napi` / `apps/npm` / `submodules/` 前提。想定外のパスは `other` に落ちるので、その場合は分割をユーザーと相談する。

**報告**: スクリプトの Markdown テーブルをそのまま提示し「このチャンク分割で進めてよいですか？」と確認。数千行の単一ファイルは関数・モジュール単位の手動分割を相談。変更があれば最終一覧を再提示してから 4-1 へ。

### Step 4-1: チャンク × Agent の実行

```
for chunk in /tmp/review-chunks.json.chunks:
    for agent in [reference, compiler, perf, tests, security, simplify, coderabbit, codex]:
        if 対象外（該当ファイルなし / CLI 未インストール）: continue
        loop:
            agent をチャンク範囲に限定して実行
            指摘ゼロ ⇒ break
            Step 4-2 で対話・修正 ⇒ 同じチャンク・同じ agent を再実行
```

**Agent の順序**: ①公式実装整合性 ②コンパイラ実装 ③パフォーマンス ④テストカバレッジ ⑤セキュリティ / メモリ安全性（`security-review`）⑥簡素化（`simplify`）⑦CodeRabbit（インストール時のみ）⑧Codex（インストール時のみ）

**カテゴリ別の適用**: parse / analyze / transform / error は全 Agent。napi は①のみ「対応する公式 API があれば」。tests は①（公式 fixture との整合）③⑤が内容次第。infra は①③×、②（shell / Cargo）④は内容次第、⑤⑥⑦⑧実行。docs は⑥⑦⑧（誤情報）のみ内容次第、他は×。other_src / other は②⑥⑦⑧実行、他は内容次第。

**共通ルール**: 各 Agent に **対象チャンク名・対象ファイル一覧（`chunks[i].files` を 1 行 1 ファイル）・`${BASE_BRANCH}`** を明示し、チャンク外は対象外とさせる。Agent は `git diff ${BASE_BRANCH}...HEAD -- <対象ファイル>` で差分を確認し、コードは修正せず報告のみ。出力は「ファイルごとに **[Critical/Major/Minor]** [ファイル:行] [内容] → [改善案]」、なければ「指摘なし」。

| Agent | 読み込むもの | 観点 |
|---|---|---|
| ① 公式実装整合性 | 公式の対応ファイル（`crates/rsvelte_core/src/compiler/phases/{1_parse,2_analyze,3_transform}/` ↔ `submodules/svelte/packages/svelte/src/compiler/phases/{1-parse,2-analyze,3-transform}/`、`error/` ↔ `compiler/{errors,warnings}.js`） | アルゴリズム・判定順序・出力バイト列・エラーコードの一致 / 命名の翻字 / 意図的逸脱の理由 / 最新版への追従。Critical=挙動差、Major=構造差、Minor=命名。指摘に公式の参照箇所を含める |
| ② コンパイラ実装 | `.claude/skills/full-code-review/implementation-checklist.md` | production パスの `unwrap`/`expect`/`panic!`/`todo!` / `Result` + `?` と `error/` 型 / 不要な `'static`・clone / `match` 網羅性 / clippy / DRY / 命名 / WHY コメント |
| ③ パフォーマンス | `.claude/skills/perf-loop/SKILL.md` + checklist の性能セクション | ループ・再帰内の割り当て / AST の `.clone()` / `serde_json::Value` / ソース借用 / `SmallVec`・`FxHashMap` / `write!`。指摘に hot path か否かと期待改善幅を含める。Critical=hot path で実測可能な悪化、Major=hot path だが実測次第、Minor=cold path |
| ④ テストカバレッジ | checklist のテストセクション | codegen 影響なら fixture が `pnpm run compatibility-report` でカバーされるか / 新ロジック・境界のテスト / エラー・警告変更に対する compiler-errors・validator テスト / 既存テスト変更で失われたケース |
| ⑤ セキュリティ / メモリ安全性 | Skill `security-review` を対象ファイル限定で呼ぶ | `unsafe` と SAFETY / u32 位置のオーバーフロー / 異常入力でのパニック / 指数時間・空間 / NAPI 境界の入力検証 / 新規依存 |
| ⑥ 簡素化 | Skill `simplify` を対象ファイル限定で呼ぶ | hot path の不要な抽象化 / rsvelte 独自の仕組みが必要か（不要なら公式と同じ構造へ） |
| ⑦ CodeRabbit | Skill `coderabbit:review` が利用可能なら対象ファイル限定で。不可なら「未インストールのためスキップ」 | 対象ファイル限定の結果のみ報告 |
| ⑧ Codex | `which codex` で確認。可なら Skill `codex-review` に対象ファイル一覧と `${BASE_BRANCH}` を明示。不可なら「未インストールのためスキップ」 | 同上 |

### Step 4-2: 結果の報告・修正・対話

1. 指摘を報告（**チャンク名・Agent 名・反復回数を明示**）
2. Critical/Major に修正案を提示
3. 承認後に修正。スキップ指示があれば記録して次へ
4. 修正が発生したら Step 4-3 へ。指摘ゼロなら次の Agent（または次のチャンク）へ

```
## [チャンク #N: 名前] / [Agent名] レビュー結果（反復 M 回目）
### 指摘事項
1. **[Critical]** [ファイル:行] [内容] → 修正案: [具体的な修正]
（なければ「指摘なし。次の Agent に進みます」）
→ 上記の修正案で対応してよいですか？変更点やスキップしたいものがあればお知らせください。
```

### Step 4-3: 同チャンク・同 Agent の再レビュー

修正後は同じチャンクに同じ Agent を再実行し、副作用と修正自体への新規指摘を検出する。反復が **5 回を超えたら**「反復が長期化しています。残った指摘をスキップして次に進みますか？」と確認する。

- **チャンク × Agent の終了**: Critical/Major がすべて解消（Minor のみ残）/ Major が残るがユーザーがスキップ承認
- **チャンクの完了**: 全 Agent が終了 → 次のチャンク。**Phase 4 の完了**: 全チャンク完了 → Phase 5
- **進捗表示**（反復ごと）: `進捗: チャンク 2/4 (transform: client/visitors/) / Agent 3/8 (Performance) / 反復 2 回目`

---

## Phase 5: テスト実行と最終サマリー

### Step 5-1: テスト・Lint

```bash
cargo fmt --all
cargo clippy --all-targets --all-features -- -D warnings
cargo test --release                       # 必ずリリースビルド
pnpm run generate-fixtures                 # 必要なら
pnpm run compatibility-report              # 公式 fixture の pass 率
./scripts/bench/bench.sh --quick           # hot path 変更時
```

NAPI 経由の挙動に影響する変更があれば:

```bash
node scripts/compat-corpus/binding.mjs --stage
pnpm run corpus:matrix
pnpm run test:napi-options && pnpm run test:vps
```

失敗時は「レビュー対象の変更が原因か、元から失敗していたか」を判別する: 元から → 別 issue として記録し本 PR で対応しない選択肢を提示 / 本 PR が原因 → Phase 4 に戻り該当箇所を再レビュー・修正。

### Step 5-2: 最終サマリー

```
## レビュー完了サマリー
### 総合判定: Approve / Request Changes / 要議論
### フェーズ別結果
| フェーズ（1 WHY / 2 設計 / 3 AST / 4 実装 / 5 テスト・Lint） | OK / NG / Skip | Critical N | Major N | Minor N |
### Phase 4 チャンク別詳細
| チャンク # | 名前 | 公式整合性 | コンパイラ実装 | パフォーマンス | テスト | セキュリティ | 簡素化 | CodeRabbit | Codex |
凡例: 指摘なし(N回) / スキップ承認(N件残, M回) / スキップ（対象外・未インストール）/ N/A
### Phase 4 全体集計（Agent ごとの総反復回数 / 指摘ゼロ達成チャンク数 / 残指摘ありチャンク数）
### テスト・パフォーマンス計測結果
- cargo test: PASS / FAIL（内訳）、clippy・fmt: クリーン / 警告 N 件
- 互換性レポート: X / Y (Z%) — 変更前比 +A / -B
- ベンチマーク: 変更前 X ms → 変更後 Y ms
### 未対応の指摘事項（理由）
### 対応済みの指摘事項
### コードオーナーへの申し送り事項（手動確認が必要な事項 / スコープ外の改善候補）
```

---

## Phase 6: コミット・プッシュ・CI 監視

1. **ブランチ安全確認**: 現在のブランチが `main` / `master` / `release*` なら「このブランチへの直接プッシュは影響が大きいため新しいブランチを推奨します。ブランチ名を指定してください」と確認。
2. **コミット・プッシュ**: 修正があれば「レビューで修正した内容をコミット・プッシュしますか？」と確認。承認後、論理単位ごとにアトミックにコミットしてプッシュ。メッセージは既存慣習（`fix:` / `refactor:` / `perf:` / `feat:` / `chore:` / `docs:`、`git log --oneline -10` で確認）に従う。
3. **CI・レビューコメント解決ループ**（PR がある場合のみ）: 「CI パスかつ未解決コメントゼロになるまでループを実行しますか？」と確認。承認後: `gh run list` / `gh pr checks` で CI を監視し失敗を修正 → `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments` の未解決コメントを 1 つずつ対応（checklist §14）→ 修正があれば再度 CI 監視 → 反復。

## 参照

| フェーズ | 参照先 |
|---|---|
| 1 | PR 説明欄、関連 Issue、サブモジュール CHANGELOG |
| 2 | `AGENTS.md`（`CLAUDE.md` はその symlink）、`README.md`、`/perf-loop` |
| 3 | `crates/rsvelte_core/src/ast/`、公式 AST 定義（`submodules/svelte/packages/svelte/src/compiler/types/`） |
| 4 | Step 4-1 の Agent 表「読み込むもの」 |
