# Phase-3 AST リファクタ — 残作業ドキュメント（サーバ 100% 達成後）

> **ゴール（ユーザー指示・継続中）:** Phase-3 (`3_transform`) の **テキストベース処理を1箇所も残さず**、
> oxc AST 構築 + `rsvelte_esrap` 印字に完全移行する。**サーバ SSR は完了**（本ドキュメント時点）。
> 残るは「旧モジュール削除」「クライアント CSR の AST 化」「コーパス 100%」。

このファイルは `feat/phase3-ast-full` ブランチの引き継ぎ。関連: `docs/ast-refactor-handoff.md`（旧・client調査）、
`docs/phase3-ast-refactor-plan.md`、`docs/corpus-remaining-work.md`、`docs/corpus-fmt-remaining-work.md`。

---

## 0. 現状（達成済み）

### ✅ サーバ SSR の AST 化 — 完了・本番デフォルト

- `server/mod.rs::transform_server` は **デフォルトで** `server/ast/server_component_ast`（純 oxc AST + `rsvelte_esrap`）を通る。
  旧テキスト `ServerCodeGenerator` は移行用 opt-out `RSVELTE_SERVER_TEXT=1` の裏に退避（削除予定）。
- **検証済み（env var なし＝AST デフォルトで）:**
  - runtime スイート: runtime-runes **993/993**、runtime-legacy **1205/1205**、hydration **77/77**
  - バイト厳密スナップショット: `compiler_fixtures` + `ssr` 全グリーン
  - フル互換性レポート **全カテゴリ 100%**（SSR 97/97、snapshot 29/29、validator 333/333、css 181/181、
    compiler-errors 145/145 …、3272 実行・0 失敗）
- ゲートコマンド（dedicated `CARGO_TARGET_DIR` 必須。debug/release 混在は spurious E0308）:
  - `cargo test --release --test runtime -- --test-threads=1`
  - `cargo test --release --test compiler_fixtures --test ssr -- --test-threads=1`
  - 互換性レポートは **単独** で: `RUST_MIN_STACK=33554432 CARGO_PROFILE_RELEASE_LTO=off cargo test --release --test compatibility_report generate_compatibility_report -- --ignored --nocapture`
  - **GOTCHA**: `--test compiler_fixtures --test ssr --test compatibility_report` を**まとめて**走らせると
    feature-unification/stale-artifact で spurious `E0308`/`Root: Serialize` が出る。compatibility_report は単独・専用 dir で。
  - **GOTCHA（flaky）**: `svelte_check` / `test_reporter` バイナリが時々リンク失敗（`ld: symbol(s) not found`）→ EXIT=101。
    ライブラリ自体はビルド成功しているのでリトライ。

---

## 1. 残作業A — 旧サーバテキストモジュールの削除（精密な計画済み・未着手）

スイッチオーバー済みなので旧モジュールは**デッドコード**だが、`server/ast/` がまだ呼ぶ関数があるため
「6 ファイル一括削除」ではない。

### 1-1. 完全に削除可能（純・旧パイプライン、AST からの参照なし）

| ファイル | 行数 |
|---|---|
| `server/build.rs` | 8579 |
| `server/transform_store.rs` | 1730 |
| `server/bridge.rs` | 2629 |
| `server/esrap_layout.rs` | 311 |
| `server/mod.rs` の `ServerCodeGenerator` struct/impl | — |

### 1-2. 削除せず**トリム**（AST パイプラインがまだ呼ぶ関数を残す）

- `server/helpers.rs` から残す: `transform_await_to_save`, `find_expression_blockers`,
  `find_const_expression_blockers`, `script_is_typescript`, `try_evaluate_with_constants`,
  `strip_ts_type_annotation`, `expr_contains_await`, `extract_constant_vars`, `extract_rune_inner`,
  `strip_ts_from_derived_inner`（＋ それらの推移的依存）。
  - **注意**: `helpers.rs` 冒頭で `pub(crate) use super::transform_store::*;` 等を **re-export** している。
    モジュールが相互に絡んでいるので、トリムは依存グラフを地道に解く必要あり。
- `server/transform_script.rs` から残す: `transform_script_content_with_imports_and_derived`
  （`server/ast/visitors/declaration_tag.rs` が使用）、`extract_comments_from_snippet_with_pos`。
- `shared/async_body.rs`（`compute_blocker_map` 他）と `server/evaluate.rs` は**再利用中＝残す**。

### 1-3. 推奨手順（各ステップ後に `cargo build -p rsvelte_core --lib` でゲート）

1. **`compute_eval_inputs(analysis, ast, source, use_async) -> (constant_vars, top_level_blocker_map)` を抽出**。
   `ServerCodeGenerator::new`（`server/mod.rs` の約 1134–1295 行）のロジックを、生き残るモジュール
   （例: `helpers.rs` か新規 `server/eval_inputs.rs`）へ移す。`server/ast/mod.rs:742` の
   `server_component_ast` が `ServerCodeGenerator::new` を呼ぶのをやめ、新関数を呼ぶようにする。
   → これで AST パイプラインが `ServerCodeGenerator` に依存しなくなる（削除の前提）。
2. **旧フォールバックパス削除**: `server/mod.rs` の `RSVELTE_SERVER_TEXT` 分岐以降（`ServerCodeGenerator` ベースの生成）を撤去。
3. **削除**: build.rs / transform_store.rs / bridge.rs / esrap_layout.rs + `ServerCodeGenerator`。
4. **トリム**: helpers.rs / transform_script.rs を「残す関数 + 依存」だけに。
5. **再検証**: runtime + compatibility_report が **100% を維持**すること。

> **想定**: モジュールが密結合のためコンパイルエラーが多発する。`cargo build` で1つずつ潰す反復作業。
> 慌てずインクリメンタルに。

---

## 2. 残作業B — クライアント CSR の AST 化（最大の残課題）

サーバは完了したが、**クライアント codegen は手書き `js_ast::codegen::generate`（`codegen.rs` 約 3305 行）のまま**。
`js_ast` IR に `Raw(String)` エスケープが多数残る（旧調査では ~198 箇所）。

- 戦略（`docs/ast-refactor-handoff.md` の詳細調査を参照）: `Raw(...)` を構造化 `JsExpr/JsStatement` variant へ
  置換して surface を縮小 → 最終的に client を **oxc AST + `rsvelte_esrap` に big-bang 切替** →
  `js_ast` の `Raw` 経由 `to_oxc` → `codegen.rs` 削除。
- esrap 出力は公式と一致するので、切替後はフィクスチャが合うはず（ただし**全フィクスチャ + コーパス無回帰**で要検証）。
- 着地済みスライス（leaf node 化）: `JsExpr::Super`, `JsExpr::MetaProperty`, `JsExpr::ImportExpression` 等。
  新 variant 追加手順は handoff doc に実証済み。

---

## 3. 残作業C — コーパス 100%（必達ゴール）

コーパスは ~10,000 エントリを**公式コンパイラと rsvelte の両方**で CSR/SSR コンパイルし、oxfmt 正規化後に
**バイト一致**を要求する。ラチェット baseline は縮小のみ許可。

### 現状の既知失敗（baseline）

| ファイル | 件数 | 内容 |
|---|---|---|
| `compat/corpus/known-failures.json` | 120 | CSR/SSR コンパイル出力の非一致 |
| `compat/corpus/fmt-known-failures.json` | 295 | rsvelte-fmt vs oxfmt+prettier-plugin-svelte の非一致 |
| `compat/corpus/svelte2tsx-known-failures.json` | 0 | ✅ 既に 100% |

### 100% にするために必要なこと

- **CSR/SSR（120件）**: 大半は **クライアント側の差異**（残作業B のクライアント AST 化 + esrap 印字が前提）。
  詳細は `docs/corpus-remaining-work.md`（バーンダウン playbook）。SSR 側はサーバ AST 化で改善が見込めるが、
  「fail if CSR **or** SSR が非一致」のため、CSR が直らないと baseline から外れないエントリが多い。
- **fmt（295件）**: フォーマッタの HTML レイアウト系（inline collapse / 長い open-tag wrap 等）。
  詳細は `docs/corpus-fmt-remaining-work.md`。サーバ AST 化とは独立。

### ⚠️ スイッチオーバーのラチェット影響（マージ前/直後の確認事項）

- `verify.mjs` のラチェット: **baseline 外の新規失敗（regression）があれば CI 失敗**。
  既知失敗が直った場合（fixedKnown）は **reminder のみ**で CI は通る。
- `corpus-compat.yml` は **`pull_request:` + `push: main` の両トリガ**（path `crates/**` 等）。
  → **PR でも走る**ので、SSR 切り替えによる回帰は **マージ前に CI で検出**される（regression があれば PR が赤くなる）。
- SSR を AST に切り替えたので、コーパスの SSR 出力が変化する:
  - **改善（SSR now passes）** → baseline を縮小すべき（reminder のみ、CI は緑）。
  - **回帰（新規 SSR 失敗）** → push-to-main で **main が赤くなる**。
- **AST パイプラインはテストスイート全体で公式とバイト一致**なので回帰確率は低いが、実コード（bits-ui 等）の
  エッジケースは未網羅。**マージ後にコーパスを実走し、baseline を再生成（縮小 or 必要なら回帰修正）すること。**
  - 実走には submodule sync が必要: `pnpm run corpus:sync`（bits-ui/flowbite/melt/shadcn/svelte.dev は未初期化）。
  - 実行: `pnpm run corpus:collect && corpus:compile && corpus:verify`。
  - baseline 更新: `node scripts/compat-corpus/verify.mjs --update`（CI=Linux が真値。macOS で生成した baseline は
    oxfmt 差で偽陽性のリスク — `docs/corpus-burndown-resume.md` 参照）。

---

## 4. 残作業D — `shared/compute_blocker_map` の AST 化

`server/ast/` は async ブロッカー解析を**文字列ベースの** `shared/async_body.rs::compute_blocker_map` /
`transform_async_body` で再利用している（出力側は 100% AST だが、入力解析側がまだテキスト）。
真の「ゼロテキスト」には、この入力解析側も AST 化が必要（`docs/ast-refactor-handoff.md §0b`）。優先度は B/C の後。

---

## 5. このブランチで完了したこと（コミット要約）

- サーバ runtime バーンダウン: ~490 → 0（server 100% parity）。最後の難所は multi-group const flattening
  クラスタ（`async-const` / `async-declaration-tag` / `async-declaration-tag-2`）。
- スイッチオーバー（`feat: SWITCHOVER — AST SSR pipeline is now the default`）: AST が本番デフォルトに。
- 詳細はコミットログ（`git log feat/phase3-ast-full`）と auto-memory `project_phase3_ast_rewrite.md` を参照。
