# Phase-3 AST リファクタ — 残作業ドキュメント（**出力 codegen は AST 化完了・内部テキスト除去が次の主作業**）

> **ゴール（ユーザー指示・継続中）:** Phase-3 (`3_transform`) の **テキストベース処理を1箇所も残さず**、
> oxc AST 構築 + `rsvelte_esrap` 印字に完全移行する。テキスト処理は今後のバグ温床なので、OSS として
> エレガントさのためにも次セッションで完遂する。
>
> **✅ 出力 codegen は AST 化完了（機能的に完了・全テスト緑）:** サーバ SSR は純 AST へ switchover（旧テキスト
> ~32k 行削除）、クライアント CSR は `to_oxc + esrap` を**デフォルト codegen 化**（手書き printer は ~6% フォールバックのみ）。
>
> **🔜 残り = 内部の中間表現テキストの除去（出力は1バイトも変わらない大規模 cleanup・§5 に全体像）:**
> ①クライアント Raw 構築 61 箇所の構造化（+`generate_expr` 除去）→ ②§4 `async_body.rs`(3,100 行) AST 化 →
> ③`.svelte.js` モジュールパスのテキストヘルパ → ④コメント保持 AST（機能不要・最後）→ ⑤ niche 4 ノード。
> これらが全部消えて初めて `codegen.rs` / `async_body.rs` を削除でき「Phase-3 ゼロテキスト」が完成する。

関連: `docs/ast-refactor-handoff.md`（client調査）、`docs/phase3-ast-refactor-plan.md`、
`docs/corpus-remaining-work.md`、`docs/corpus-fmt-remaining-work.md`。

---

## 0. 現状（達成済み）

### ✅ サーバ SSR の AST 化 — **switchover 完了・旧モジュール削除済み**

- `transform_server()` は **無条件で** `server/ast/server_component_ast`（純 oxc AST + `rsvelte_esrap`）を呼ぶ。
  `RSVELTE_SERVER_AST` opt-in は撤去。`None` はフォールバックではなくエラー。
- AST パイプラインは `ServerCodeGenerator` 非依存化（`helpers::compute_eval_inputs` に
  `constant_vars` / `top_level_blocker_map` 収集を抽出）。
- **削除済み**: `build.rs`(8579)・`bridge.rs`(2629)・テキスト `server/visitors/` ツリー全体・
  `esrap_layout.rs`・`template_rune_ast.rs`・`ServerCodeGenerator` struct/impl・
  `helpers`/`transform_script`/`transform_legacy`/`transform_store`/`types` の死関数 ~80 個。**net −31.6k 行**。
  AST が旧 visitors から借りていた 2 関数（`locate_in_source` / `infer_namespace_from_nodes_owned`）は
  `ast/visitors/shared.rs` へ移設。
- **コーパス回帰潰し（88 → 18、その後 switchover）:** 直したクラスタ —
  (A) component/slot prop の `$.stringify` 過剰付与（`scope.evaluate` 定数畳み込みを移植）、
  (C) `uses_component_bindings` 下の top-level `{#snippet}` を `$$render_inner` の手前へ巻き上げ、
  `$host()` → `void 0`、`onload`/`onerror` の `this.__e=event` capture、
  scope class を style ディレクティブの `attr_style` より前に、scoped `<option>/<select>` の `{ class: "" }` 合成、
  TS-aware reparse + TS ラッパ strip（`x as T` 等）、option/select spread の clsx 非ラップ、
  named-slot 転送（`<slot slot="x">`）、get/set bind のソース順。
- **コーパス baseline 再生成: 120 → 69 known failures**（net −51。69 直り・18 新規をトラック）。
  `verify.mjs`: **no regressions**。残り 18 はすべて svelte 内部のテスト/ドキュメント fixture または
  legacy `destructured-props` クラスタ。
- **curated ゲート全グリーン（AST デフォルトで、env 不要）:** runtime 19/19、compiler_fixtures 17/17、ssr 16/16。

### ⚠️ switchover で顕在化した AST パイプラインの既知ギャップ（§3 の一部）

互換性レポート（`#[ignore]` のトラッキング専用・CI ゲートではない）で 4 件の **Server JS mismatch**:
旧テキストパスは通っていたが AST パスが未対応のもの。
- **(B) instance script コメント保持**（`async-style-after-await`, `hmr-each-keyed-unshift` ほか）—
  `ast/script.rs` の statement rehome が `reparse_statement`（`SourceType::mjs`）でコメントを捨てる。
  真の修正は再構成プログラム全体への comment span 再マッピング（esrap `print_with_comments` / `CommentHooks`）。
  コーパスの comment-drop 群と同根。
- **HMR マーカー構造**（`hmr-removal`）。
- **`<svelte:boundary>` の pending スニペット SSR 構造**（`hydration/boundary-pending-attribute`）。
- （互換性レポートの svelte2tsx 7 件は SSR と無関係・既存。本作業の回帰ではない。）

### ゲートコマンド（dedicated `CARGO_TARGET_DIR` 必須。debug/release 混在は spurious E0308）
- `cargo test --release --test runtime --test compiler_fixtures --test ssr -- --test-threads=1`
- 互換性レポートは **単独** で: `RUST_MIN_STACK=33554432 CARGO_PROFILE_RELEASE_LTO=off cargo test --release --test compatibility_report generate_compatibility_report -- --ignored --nocapture`
- コーパス: `pnpm run corpus:sync`（submodule + `cd submodules/svelte && pnpm i`）→
  `cargo build --release --features napi --lib && cp target/release/librsvelte_core.dylib .corpus-cache/rsvelte.node` →
  `pnpm run corpus:collect && corpus:compile && corpus:verify`。verify は両側 oxfmt 正規化なので
  CSR/SSR baseline はプラットフォーム非依存（macOS で `--update-baseline` 可。fmt corpus は別＝Linux が真値）。

---

## 1. 残作業A — 旧サーバテキストモジュールの削除 — ✅ **完了**

上記 §0 の通り削除済み（net −31.6k 行）。以下は当時の計画（履歴として保持）。

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
2. **デフォルト化 + 旧パス削除**: `server/mod.rs` の `RSVELTE_SERVER_AST` opt-in 分岐を恒久 ON にし、
   以降の `ServerCodeGenerator` ベースの生成（旧フォールバック）を撤去。
3. **削除**: build.rs / transform_store.rs / bridge.rs / esrap_layout.rs + `ServerCodeGenerator`。
4. **トリム**: helpers.rs / transform_script.rs を「残す関数 + 依存」だけに。
5. **再検証**: runtime + compatibility_report が **100% を維持**すること。

> **想定**: モジュールが密結合のためコンパイルエラーが多発する。`cargo build` で1つずつ潰す反復作業。
> 慌てずインクリメンタルに。

---

## 2. 残作業B — クライアント CSR の AST 化 — ✅ **AST がデフォルト化済み**

**big-bang 不要だった。** `js_ast::to_oxc` が `Raw`/`RawMapped` を**パース**し `Spanned` を展開するように
したことで、`to_oxc → rsvelte_esrap::print` が **クライアントのデフォルト codegen** になった（手書き
`codegen.rs::generate` は今や ~6% のフォールバックのみ）。検証: runtime 19/19・compiler_fixtures 17/17・
ssr 16/16・sourcemaps 16/16・コーパス無回帰。

- **キー解決＝空文 (`;;`) パリティ**: esrap は body から `EmptyStatement` を除去するが（サーバ/公式 esrap と一致）、
  公式**コンパイラ出力**は string-codegen が出す `;;` を保持し、それを `to_oxc` が実 `EmptyStatement` にパースする。
  → `PrintOptions.keep_empty_statements`（既定 false=除去・サーバ用、client `to_oxc` は true）を追加して byte 一致。
  （※「空行パリティ」説は誤りだった。`compare_js` は AST 比較で空行は無視。）
- sourcemap は `Spanned`/`RawMapped` の元ソースオフセットを span に焼き込み、esrap `print_with_map` ＋
  `esrap_mappings_to_source_mappings` で配線済み。
- **`codegen.rs` 完全削除に残るフォールバック要因**:
  1. **コメント保持** — コメントを含む `Raw` は `to_oxc` がバイル（パース→印字でコメント脱落するため、
     verbatim string codegen にフォールバックして保持）。AST 側コメント保持（synthetic-source + span-offset、
     または esrap CommentHooks）が要る。
  2. **4 つの niche ノード** = 計算プロパティ分割代入（`{ [0]: a } = x` 等）。
  3. **`generate_expr`** — ~10 visitor が式を文字列化して `Raw` に詰めている（`to_oxc` が再パースするので
     出力は AST だが中間がテキスト）。真のゼロテキストには visitor が構造化 `JsExpr` を直接組む必要。
  これらが消えれば `codegen.rs`（印字器 + `generate_expr`）を削除できる。

---

## 3. 残作業C — コーパス 100%（必達ゴール）

コーパスは ~10,000 エントリを**公式コンパイラと rsvelte の両方**で CSR/SSR コンパイルし、oxfmt 正規化後に
**バイト一致**を要求する。ラチェット baseline は縮小のみ許可。

### 現状の既知失敗（baseline）

| ファイル | 件数 | 内容 |
|---|---|---|
| `compat/corpus/known-failures.json` | **69**（120→69、switchover で −51） | CSR/SSR コンパイル出力の非一致。残りの大半は **CSR 側**（§2 の client AST 化が前提）。SSR 由来の 18 はコメント保持・`destructured-props`・タグ名小文字化・unicode エスケープ等。 |
| `compat/corpus/fmt-known-failures.json` | **0** ✅ | （PR #1111 で達成済み。本ドキュメント旧版の 295 は古い） |
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

## 4. 残作業D — `shared/async_body.rs`（`compute_blocker_map` / `transform_async_body`）の AST 化

**文字列ベースの巨大モジュール（約 3,100 行）。** `raw_script: &str` を受け取り `output: String` を返す
async body 分割 + blocker 解析で、サーバ AST パイプラインとクライアント両方が再利用している（出力側は AST だが、
この入力解析側がまだテキスト）。`memmem` ベースの手書きスキャン多数。真の「ゼロテキスト」にはここの AST 化が必要。
**規模が大きく、機能的価値はゼロ（出力は不変）**なので、§2 の Raw 構築除去と並ぶ最後の big-bang。

---

## 5. 「ゼロテキスト」に向けた残作業の全体像（次セッションの主作業）

> **重要（ユーザー方針）:** テキストベース処理は今後のバグ温床になり、OSS としてエレガントさも追求したいので
> 次セッションで対応する。**出力 codegen は既に AST 化済み（機能的には完了・全テスト緑）**で、残りはすべて
> 「内部で一旦テキストを組み立てて再パースする」中間表現レベルの除去 ＝ **出力は1バイトも変わらない大規模 cleanup**。

優先順位（ユーザー合意: コメント保持は機能不要なので後回し、`generate_expr`/§4 を先に）:

1. **クライアント Raw 構築の構造化（§2 の本丸）** — `js_ast::nodes::JsExpr::Raw` / `JsStatement::Raw` 生成が
   client 全体で **61 箇所**。visitor が文字列連結で statement/expr を組み、`to_oxc` が再パースしている。
   ファイル別: `bind_directive.rs`(24)・`shared/component.rs`(21)・`mod.rs`(12)・`expression_converter.rs`(11)・
   `shared/utils.rs`(7)・`await_block.rs`(4)・`fragment.rs`/`each_block.rs`/`declaration_tag.rs`(各3)・`const_tag.rs`(2)。
   - `generate_expr`（codegen.rs）呼び出しは **5 箇所のみ**（`shared/component.rs` の bind get/set アクセサ、
     `each_block.rs` の invalidation 式）。ただし `format!("({})($$value)", ...)` のような**文字列プレフィックス除去 +
     再フォーマット**に深く絡むため、bind/each ハンドリングの end-to-end 構造化が前提。
   - これらを `b::*` 構造化ビルダーに置換 → `to_oxc` が Raw を一切パースしなくなる → `generate_expr` 除去。
2. **§4 `async_body.rs` の AST 化**（3,100 行・上記参照）。
3. **`.svelte.js` モジュールパス**（`transform_server_module`）が依存する `transform_script`/`transform_store`/
   `transform_legacy` のテキストヘルパ群。
4. **コメント保持 AST**（最後）— `to_oxc` がコメント付き `Raw` をバイルして string codegen にフォールバックして
   いる（~6%）。**機能的には不要**（公式出力に `@__PURE__`/ライセンス等の機能コメントは fixtures 全数で 0 件、
   残るユーザー散文コメントは bundler が除去）。AST 側保持には synthetic-source + span-offset、または
   esrap CommentHooks（ただし `var // c\n x` の文中コメントは CommentHooks 不可）。
5. **4 つの niche ノード** = 計算プロパティ分割代入（`{ [0]: a } = x`、`{ [`${a}-D`]: {..} } = ..`）。
   `to_oxc` の object-pattern が computed key を扱えずバイル → string codegen フォールバック。

これら **1〜5 がすべて消えて初めて `codegen.rs`（印字器 + `generate_expr`）と `async_body.rs` を削除でき、
「Phase-3 テキスト処理ゼロ」が完成**する。

### このブランチ（`feat/server-ast-switchover`）で完了したこと

- **サーバ SSR**: 純 AST パイプラインへ switchover、旧テキスト生成器 **約 31,900 行削除**（§0/§1）。
- **クライアント CSR**: `to_oxc` が `Raw`/`RawMapped` をパース + `Spanned` 展開 → `to_oxc + esrap` を
  **デフォルト codegen 化**（§2 のデフォルト切替）。手書き printer は ~6% のフォールバックのみ。
  - キー解決 = `PrintOptions.keep_empty_statements`（サーバ=除去、client=保持）で空文 `;;` パリティ達成。
  - sourcemap は `Spanned`/`RawMapped` の元オフセットを span 焼き込み + esrap `print_with_map` で配線。
- corpus baseline 120 → 67（net −53）。全 CI ゲート緑（runtime 19/19・compiler_fixtures 17/17・ssr 16/16・
  sourcemaps 16/16・real_world 15/15・互換性レポート全カテゴリ 100%）。
- 関連メモリ: `~/.claude/.../memory/project_server_ast_switchover.md`（クラスタ別の修正内容・GOTCHA 収録）。
- 詳細はコミットログ（`git log feat/phase3-ast-full`）と auto-memory `project_phase3_ast_rewrite.md` を参照。
