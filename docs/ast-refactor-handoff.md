# Phase-3 AST リファクタ — 次セッション引き継ぎ手順書

> **ゴール（ユーザー指示・継続中）:** Phase-3 (3_transform) の **テキストベース処理を1箇所も残さず**、
> oxc AST 構築 + `rsvelte_esrap` 印字に完全移行する（サーバ SSR を最優先、クライアント CSR も）。
> 数週間規模の多数 PR からなる取り組み。**常時グリーン**（コーパス無回帰 + 全フィクスチャ + CI）を厳守。

このファイルだけ読めば再開できるように書いてある。まず本ファイル → `docs/phase3-ast-refactor-plan.md`
（特に末尾の「Findings (2026-06-19)」）→ `docs/corpus-remaining-work.md` の順で読むこと。

---

## 0. 現在の状態（2026-06-19 時点）

- **main**: `99725cca fix(ssr): burn output-equality corpus + esrap-faithful SSR codegen (#1092)` がマージ済み。
  これにより **コーパス既知失敗 248 → 120 件（128件解消、約52%）**、全CIグリーン。
- **作業ブランチ**: `feat/phase3-ast-refactor`（origin/main から作成、リモートに push 済み）。
  現状このブランチには計画ドキュメント更新コミット1個（`docs(refactor): record single-pass-AST requirement…`）のみ。
- **ワークツリー**: `/Users/baseballyama/git/rsvelte-ssr-esrap`（origin/main の worktree。ユーザー指示によりワークツリーで作業）。
- 残コーパス失敗は `compat/corpus/known-failures.json`（120件）。CI ラチェットは縮小のみ許可。

### 進捗ログ
- **2026-06-19 PR #1097（Step 1+3 開始: client `js_ast` の Raw 削減、コーパス 120 据え置き）**:
  ユーザー判断で「大物の Step 1+3」を開始。**調査で判明した地形（重要）**:
  - **サーバ codegen は既に `rsvelte_esrap::print` 経由**（`server/build.rs::normalize_script_with_oxc`、
    oxc parse → esrap print）。残る `$$C$$` hex コメント密輸 + `decode_in_call_comment_placeholders` と
    `esrap_layout.rs` の reflow が Step 1（コメントストリーム）で消す対象。
  - **client codegen は手書き `js_ast::codegen::generate`（codegen.rs 3305行）**＝Step 3 の本丸。
    `js_ast` IR に `Raw(String)` エスケープが **~198箇所**。多い順: `server/bridge.rs`(49, SSR markers),
    `client/.../expression_converter.rs`(46, JSON-AST→JsExpr の fallback), `server/build.rs`(25),
    `client/.../bind_directive.rs`(15), `client/mod.rs`(11), `client/.../shared/utils.rs`(10)。
  - **常時グリーンな漸進戦略**: client の `Raw(...)` を、codegen が既に扱う**構造化 JsExpr/JsStatement variant**へ
    置換して surface を縮小 → 最終的に client を oxc AST + esrap に big-bang 切替（esrap 出力＝公式と一致するので
    フィクスチャは合うはず、ただし要全フィクスチャ検証）。**注意**: `Raw` のうち「リテラルの逐語保存」
    （`expression_converter.rs` の二重引用符文字列 217 / 特殊数値 237 / bigint 251）は **テキスト処理ではなくトークン保存**で
    良性、優先度低。本当に潰すべきは文字列**構築/連結**型 Raw（import.meta の `format!`、SSR bridge の文字列組立等）。
  - **着地済みスライス（2件、leaf node）**: `JsExpr::Super`（`Raw("super")` 駆逐）と
    `JsExpr::MetaProperty(meta, property)`（`Raw(format!("{}.{}", …))`＝import.meta 駆逐）。各々コーパス 120 据え置き・
    build/clippy/fmt clean・CI（前者）green。**新 variant 追加手順（必須・実証済み）**: nodes.rs enum +
    codegen.rs arm + 網羅 match 群に leaf として追加（`has_await_expression_arena`,
    `apply_transforms_to_expression_with_shadowed` の `=> expr.clone()` 群,
    `collect_reactive_references_inner` の terminal 群）。`cargo check -p rsvelte_core` が未カバー match を全列挙するので
    それを潰す（leaf は This/Super と同じ群へ）。1スライス＝napi build(~2m40s)+corpus(~13s)+clippy。
  - **着地済み追加（sub-expression を持つ node の手本）**: `JsExpr::ImportExpression{source, options}` で
    dynamic `import(...)` を構造化。**重要な手本**: 旧 Raw は変換時に `generate_expr` で source/options を**先食い文字列化**して
    凍結＝後段の解析パスから不可視だった。これをバイト一致で再現するため、新 node は sub-ExprId を持つが
    **解析3パスでは terminal 扱い**（has_await/apply_transforms/collect_reactive の Raw と同じ群に追加、再変換しない）、
    codegen のみが lazy に emit。codegen の優先順位 `matches!` 述語は **import() は call 同様 atomic なので変更不要**
    （Call が載っていない＝括弧不要のデフォルト）。これで `generate_expr` 先食い（真のテキスト生成）を除去。
    検証: コーパス 120 据え置き・build/clippy/fmt clean。
  - **leaf Raw は概ね枯れた**。残る client Raw は **sub-expression を持つ**ため leaf 追加より surface が大きい:
    dynamic `import(source, options)`（現状 `generate_expr` で source/options を**先食い文字列化**＝真に潰すべき
    テキスト生成。`ImportExpression{source:ExprId, options:Option<ExprId>}` 化には has_await/apply_transforms/
    collect_reactive **に加え codegen の演算子優先順位/括弧付け group 群**(codegen.rs 962/1263/1299/1329/1602)へも
    正しく追加要), 分割代入 LHS パターン(`pattern_to_string`), `bind_directive.rs`(15, 手書き arrow)。
    `expression_converter.rs` の「Unknown」fallback(1851/1856/1866)や literal 逐語保存(217/237/251)は良性で対象外。
    → これらは**集中した専用作業**向き（session 終盤の細切れ grinding より、まとめて慎重に）。
  - **★★ 決定的知見（2026-06-19 実験、big-bang を大幅 de-risk）★★**: client の最終出力（`js_ast::codegen::generate`
    の文字列）を **oxc parse → `rsvelte_esrap::print` で再印字**する実験的ポストパスを入れて全 byte-exact suite を測定:
    **`runtime` 19/19・`compiler_fixtures` 17/17・コーパス 120（NEW 0）すべてバイト一致でパス**（コメント込み）。
    → **手書き client codegen の出力は、それを再パースして esrap 印字したものと完全にバイト一致**＝
    codegen は既に esrap を完璧に模倣している。重要な含意:
    1. **direct-AST 版 Step 3（client visitor が oxc AST を直接構築 → esrap 印字）は一致出力を出すと実証済み**
       （esrap がターゲットで、codegen が既に esrap と一致するため）。big-bang のリスクは出力一致ではなく**実装量**のみ。
    2. **コメント位置はクライアントでは問題にならない**（再パース+esrap でも全フィクスチャ一致）。Step 1（コメントストリーム）は
       サーバの `$$C$$` 除去には要るが、クライアント big-bang のブロッカーではない。
    実験はコミットせず revert 済み（理由: ポストパスは codegen を**消さず** esrap を上乗せするだけ＝テキスト処理は残り、
    かつ parse+print 二度手間の **perf 退行**。handoff §non-goals の「perf 退行は profile してから」に反する）。
    **次セッションの推奨**: この実証を踏まえ、**direct-AST 版 Step 3**（codegen を消して oxc AST 直接構築）を本命として進める。
    検証は `pnpm run generate-fixtures` 後に `cargo test --release --test runtime --test compiler_fixtures`（byte-exact gate）。
    なお `cargo test` のターゲット名は `runtime` / `compiler_fixtures` / `compiler_err` 等（`snapshot`/`ssr` という単一ターゲットは無い。
    ssr は `ssr_*` 個別ファイル）。`svelte_check` bin が時々リンク失敗（既知 flaky）。
  - **★ direct-AST Step 3 の土台着地（PR #1097, flag-gated・byte-exact 検証済み）★**:
    新モジュール `js_ast/to_oxc.rs` の `program_to_oxc(&JsProgram, &JsArena, &Allocator) -> Option<Program>`＝
    client `js_ast` IR を **oxc `AstBuilder` で oxc `Program` に直接構築** → `rsvelte_esrap::print` で印字
    （codegen を介さない真の direct-AST）。**安全機構**: 未対応 variant / `Raw` / `Spanned` で `None` を返し、
    呼び出し側（client/mod.rs）は codegen にフォールバック＝部分対応でも常に正しい。`RSVELTE_CLIENT_TO_OXC` env flag で
    gate（**既定 OFF**＝コミット状態は無変更でグリーン）。**flag ON で byte-exact 検証済み: runtime 19/19・
    compiler_fixtures 17/17 パス**（フィクスチャ内の全 structured client program で codegen とバイト一致を実証）。
    対応済み: 大半の式（identifier/literal/this/super/meta-property/member/call/new/binary/logical/unary/conditional/
    sequence/array/object/spread/await/void/arrow）+ 一般的な文（expression/return/var-decl(識別子のみ)/block/empty/
    debugger/throw/break/continue/if）。bail: template-literal/tagged-template/function/update/assignment/yield/class/
    chain/import-expr、分割代入パターン、import/export/loops/switch/try、全 Raw。
    **次の作業（burn-down）**: bail している variant を1種ずつ `to_oxc.rs` に追加（oxc AstBuilder API は
    `~/.cargo/git/checkouts/oxc-2492aa67f5b41d4f/37a34a1/crates/oxc_ast/src/generated/ast_builder.rs` 参照。
    `NONE` は `oxc_ast::NONE`、文字列は `ab.allocator.alloc_str(s)`、`ab.expression_identifier(SPAN, &str)` 等）。
    各追加ごとに `RSVELTE_CLIENT_TO_OXC=1 cargo test --release --test runtime --test compiler_fixtures`（byte-exact gate。
    ※ `parse_profile`/`svelte_check` bin が時々リンク失敗＝flaky、リトライで通る）。Raw が全廃 + 全 variant 対応 +
    コメントストリーム（Step 1: `print_with_hooks` 経由）が揃ったら flag を**既定 ON** に反転 → codegen 削除。
    template-literal は IR の cooked/raw を oxc TemplateElement に、assignment/update は演算子マップ追加でほぼ機械的。
  - **最終的な本丸**: client を `js_ast::codegen` から「oxc AST 構築 + `rsvelte_esrap::print`」へ big-bang 切替
    （esrap 出力＝公式コンパイラ準拠なのでフィクスチャは原理上一致するはずだが、**全 byte-exact フィクスチャ + コーパス
    での検証必須**）。Raw 全廃はその前提条件。server 側は `normalize_script_with_oxc` が既に esrap なので、
    Step 1（`$$C$$` hex コメント密輸 → esrap comment hooks `print_with_hooks` へ）で server のテキスト後処理を消す。
- **2026-06-19 PR #1097（Step 2a: derived script-path 3 パスを AST 化、全てバイト一致・コーパス 120 据え置き）**:
  derived バインディングの script 経路テキスト処理を **元の妥当な script 上の単一 AST パス** に統合。
  旧テキスト走査は全て post-wrap の **不正 JS**（`count()++` / `count() = x`：call は代入先になれず再パース不能）を
  走査していた＝§4 の問題そのもの。各旧走査は `wrap_derived_reads_in_script` の **バイトスキャナ fallback 経路でのみ** 生存。
  1. **update 式** `count++`→`$.update_derived(count)`、`--count`→`$.update_derived_pre(count, -1)`
     を `derived_reads_ast::visit_update_expression`（`UpdateExpression{argument: AssignmentTargetIdentifier}`）。
  2. **assignment** `count = x`→`count(x)`、複合/論理 `count += 1`→`count(count() + 1)` を
     `derived_reads_ast::visit_assignment_expression`。LHS を skip_spans でバイパス→`op=` gap を `(` か
     `(name<read> <binop> ` に置換→RHS 末尾に `)` 追加、という **非重複編集** で RHS の read-wrap と
     入れ子 `a = b = 1` を1パスで両立（stable right-to-left splice）。
  3. **$.derived thunk 畳み込み** `$.derived(() => name())`→`$.derived(name)` を新モジュール `unthunk_derived_ast`
     （post-wrap 妥当 JS なので普通に再パース）。
  検証: コーパス 120 据え置き（NEW 0）、`derived_reads_ast` 26/26・`unthunk_derived_ast` 5/5、clippy/fmt clean、CI green。
  **次（task #3 継続）**: 残る script 経路バイトスキャナを順に AST 化。候補（孤立・妥当 JS 優先）:
  `remove_rune_statement`（$effect/$inspect 除去・コメント密輸と絡む＝やや難）、`transform_class_fields_server`、
  store-sub `transform_store_*`。**地雷回避**: template 経路（`wrap_derived_reads_for_template` 84箇所＝§4）、
  `$state.snapshot`（§5）、`each_array` 連番（§5）は単独で触らない。
  大物 = `js_ast` の `Raw(` ~185箇所→oxc AST + esrap（Step 1+3）、blocker 解析（Step 4）、fallback 削除（Step 5）。
  **重要**: 各 `*_ast.rs` パスは「AST 駆動のテキスト編集（splice）」であり最終形ではない。ゴール（テキスト処理ゼロ）には
  Step 1+3 で出力 IR 自体を AST 化し、Step 5 で fallback バイトスキャナを全削除する必要がある。

### 再開手順
```bash
cd /Users/baseballyama/git/rsvelte-ssr-esrap
git fetch origin && git checkout feat/phase3-ast-refactor && git rebase origin/main   # 必要なら
```

---

## 1. 環境セットアップ（ワークツリーは未セットアップなことがある）

一度きりの重いセットアップ。`RAYON_NUM_THREADS=2` + `nice` でローカル負荷を抑える。
```bash
cd /Users/baseballyama/git/rsvelte-ssr-esrap
pnpm install
git submodule update --init --depth 1 submodules/svelte           # 公式コンパイラ(オラクル)
(cd submodules/svelte && pnpm install --frozen-lockfile)           # esrap 等が必要
git submodule update --init --depth 1 submodules/svelte.dev submodules/bits-ui \
    submodules/flowbite-svelte submodules/melt-ui submodules/shadcn-svelte
node scripts/fixtures/generate-fixtures.mjs                        # フィクスチャ生成
node scripts/compat-corpus/collect.mjs                             # コーパス収集(~10,160 entries)
```

---

## 2. ビルド/検証ループ（★最重要の教訓あり★）

ユーザー指示: **lint/test は CI で**、ローカルは「制約付きビルド」のみ（マシンが重いため）。
ただし NAPI バイナリのビルドはコーパス検証に必須。

### ★教訓1: ビルドは必ず「1本ずつ」★
複数の `cargo build` を並行させると競合してマシンが thrash し、1ビルドが **20分超** に膨れる
（本セッションの遅延の主因はこれだった）。**新しいビルドを始める前に必ず既存ビルドの完了を待つ**か、
`pkill -9 -f "cargo build --release --features napi"; pkill -9 rustc` で殺してから1本だけ走らせる。
1本なら(ロード次第で)概ね数分〜10分弱で完了する。

### NAPI ビルド + ステージ
```bash
export CARGO_TARGET_DIR=/tmp/rsvelte-ssr-target CARGO_BUILD_JOBS=6 RAYON_NUM_THREADS=2
nice -n 10 cargo build --release --features napi --lib            # ← 並行させない！ -p は使わない(フル再ビルドになる)
cp /tmp/rsvelte-ssr-target/release/librsvelte_core.dylib .corpus-cache/rsvelte.node   # Linux は .so
```
- ★教訓2: `cargo build --lib` は capi のリンク(遅い)まで待つが、**dylib は rsvelte_core 完了時点で更新される**。
  `stat -f "%Sm" /tmp/rsvelte-ssr-target/release/librsvelte_core.dylib` の mtime が更新されたら、
  capi リンク完了を待たずに即ステージ→検証してよい。
- ★教訓3: ポーリング（`grep Finished` 等）を毎ターン叩くと nice されたビルドの CPU を奪い遅くなる。
  バックグラウンドビルドの**完了通知を待つ**のが速い。

### コーパス検証
```bash
node scripts/compat-corpus/compile.mjs                            # 両コンパイラ×両ターゲット (~13s)
node scripts/compat-corpus/verify.mjs --max-print 0               # 回帰チェック。"NEW failures" が出たら即 revert 判断
node scripts/compat-corpus/cluster.mjs                            # 失敗を差分シグネチャでグルーピング
node scripts/compat-corpus/one.mjs '<id>' --target server         # 1件の差分(正規化後)
node scripts/compat-corpus/one.mjs '<id>' --target server --raw   # 生差分
node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline  # 修正がクリアしたらベースライン縮小
```

### ★教訓4: 比較は formatting を吸収する → byte-exact 回帰はコーパスで見えない★
`verify.mjs` は oxfmt + acorn AST-structural 比較で、**空行・コメント・引用符・インデントを正規化吸収**する。
よって「空行/コメント位置」の回帰はコーパスでは無罪放免だが、**byte-exact なフィクスチャ suite（runtime/ssr/snapshot）では落ちる**。
→ byte-exact suite は CI 任せ。コーパス無回帰でも CI で runtime 等が落ちることがある（毎 push で CI 確認）。
また「コーパスで X件 NEW failure」のとき、差分は **whitespace-insensitive** で取ると構造的差分が見える
（`s.split('\n').map(l=>l.replace(/\/\/.*$/,'').trim()).filter(Boolean)` で比較）。

### ★教訓5: push ごとに CI を**全ゲート**確認★（corpus だけ見ない）
本セッションで Clippy が数 push 失敗し続けたのを見落とした。`gh pr checks <PR>` で
Clippy / Documentation / Test runtime / Compatibility Report / Corpus / fmt を毎回確認。
よく踏むCIエラー: `clippy::collapsible_if`（let-chain 化）、`clippy::manual_strip`（`strip_prefix` 使用）、
rustdoc broken-intra-doc-links（`[`fn`]` リンクは別モジュールだと壊れる→ただの code 表記に）。
`cargo fmt -p rsvelte_core` を commit 前に必ず実行。pre-commit hook はこのワークツリーでは無効。

---

## 3. アーキテクチャ（現状 → 目標）

### 現状（テキスト処理が残っている箇所＝駆逐対象）
- `server/transform_script.rs`（~7.7k行）: `wrap_derived_reads*`, `remove_rune_statement`,
  `compute_shadow_ranges`, `mask/unmask_nested_reactive_labels`, `rewrite_derived_update_expressions`,
  `transform_class_fields_server`, `transform_store_*` など**バイトスキャナ群**。
- `server/helpers.rs`: `skip_string_literal`, `skip_braces`, `extract_imports*`, await バイトスキャン等。
- `shared/async_body.rs`: `compute_blocker_map(raw_script)` の生スクリプト走査。
- `server/transform_legacy.rs`: `mask_nested_reactive_labels` 等。
- `server/build.rs`: `normalize_script_with_oxc`（oxc parse→esrap print の**サブブロック専用**）、
  コメント hex 密輸（`$$C$$`）、`strip_empty_statements`、再インデントループ等の**文字列ポストパス**。
- `server/esrap_layout.rs`: `${...}` の改行有無を esrap に合わせる**文字列 reflow**（AST化すれば不要）。
- 出力 IR: `3_transform/js_ast/`（`nodes.rs`/`builders.rs`/`codegen.rs` 125KB）= **独自 IR + 独自 codegen**。
  `Raw(String)` 抜け穴が **client+server 合わせて ~185箇所**。最終印字は `js_ast::codegen::generate`（esrap ではない）。
- `transform_server_module`（mod.rs:130〜, `.svelte.(js|ts)`）は**完全に文字列ベース**（`parts: Vec<String>` を join）。

### 目標
template AST + 解析 →（visitor で oxc AST を AstBuilder 構築）→ `rsvelte_esrap::print` で一度だけ印字。
`rsvelte_esrap` は完成済み（`crates/rsvelte_esrap/`、oxc 0.136、コメントストリーム・raw 保持・sourcemap 対応、
golden + esrap サンプル green）。upstream の `submodules/svelte/.../3-transform/server/` が**仕様**（`b.*` builder）。

---

## 4. ★決定的知見（必読）: derived-read 等は「単一 AST パス or 全滅」★

`docs/phase3-ast-refactor-plan.md` 末尾「Findings (2026-06-19)」に詳述。要点:

- **インスタンス/モジュール script の `wrap_derived_reads` は既に AST**（`server/derived_reads_ast.rs`）で、
  「derived を 0引数 callee として呼ぶ」ケースを一律 wrap するよう拡張済み（`inactive()` → `inactive()()`）。
  これで **`$derived` currying をインスタンス側で回帰ゼロ修正**できた＝**AST 方式が正解の証拠**。
- **テンプレート式の derived wrap は1パスずつ AST 化できない。** `wrap_derived_reads_for_template` は
  store 変換後・**一部が既に `name()` に wrap 済み**のテキストに対して、しかも**84箇所**から多段で呼ばれる。
  バイトスキャナの「call位置スキップ」は currying 対策ではなく**冪等性（二重wrap防止）のために load-bearing**。
  → テンプレート経路を AST パスに通すと既wrap `code()` が `code()()` に**二重化し ~220件回帰**（2回実証）。
- **核心:** ソースの `derived()`（currying＝`derived()()` にすべき）と既wrapの `derived()`（そのまま）は、
  部分変換後では**テキストでも AST でも区別不能**。→ **derived/store/special-var 変換は「生の式 AST に一度だけ」**
  適用する単一パスに統合する以外に道はない。Step 2/3 は多段テキスト wrap を**一括で単一 AST パイプラインに置換**する。

---

## 5. ★地雷（やってはいけない / 回帰多発として実証済み）★

本セッションで試みて爆発・revert したもの（中央検証で着地前に阻止した）。ドキュメント `corpus-remaining-work.md`
の「reverted twice / 498-failure」警告と一致。**AST 単一パス化以外の方法で触らないこと。**

| 領域 | 何が起きたか |
|---|---|
| テンプレート経路を AST パスに routing | ~220件回帰（二重wrap）。§4 参照。単一パス再構成が前提。 |
| `each_array` のカウンタ共有/順序変更 | **529件回帰**（コンポーネント全体で each_array 番号が再採番）。 |
| `should_proxy`（props を default 型で non-proxy 分類） | runtime フィクスチャ含む回帰。`client/mod.rs` の `non_proxy_vars` に文書化済みガードがあり、反転禁止。 |
| `$.snapshot` 意味論 | 2方向（追加すべき/削除すべき）が混在、相互依存で回帰しやすい。 |
| サブエージェントへの繊細なバイト一致変換の丸投げ | タイムアウト/誤診断/文書化済み決定の反転を**複数回**起こした。**必ずメインが diff レビュー + 中央検証**。 |

---

## 6. 検証ゲート（各 PR で）

```bash
# byte-exact フィクスチャ（CI でも走るが、リスキーな変更はローカルでも。1本ずつビルド後）
CARGO_TARGET_DIR=/tmp/mywork RUST_TEST_THREADS=2 RAYON_NUM_THREADS=2 RUST_MIN_STACK=33554432 \
  cargo test --release --test runtime --test ssr --test compiler_fixtures --test snapshot
# esrap クレート（printer 変更時）
cargo test -p rsvelte_esrap --release        # golden_roundtrip_ratchet + samples
# lint/fmt
cargo fmt && cargo clippy --all-targets --all-features -- -D warnings
# コーパス（§2）→ ベースラインは縮小のみ。NEW failure が1件でも出たら原因特定 or revert。
```
- 変更系統が `fix`/`feat` の PR は **changeset 必須**（`.changeset/*.md`、`"@rsvelte/compiler": patch`）。
- マージは squash（`gh pr merge <PR> --squash`、draft なら先に `gh pr ready`）。

---

## 7. 推奨ステップ順（常時グリーン・1 PR ずつ）

`docs/phase3-ast-refactor-plan.md` の Step 1〜5 に従う。具体化:

1. **Step 2a: サーバ script 変換の単一 AST パス化**（最大の勝ち）。
   `transform_script.rs` の **インスタンス/モジュール script** 系パス（`remove_rune_statement`,
   `rewrite_derived_update_expressions`, `transform_class_fields_server`, store サブ解決, assignment lowering）を
   `oxc_ast_visit` ベースの**単一 pipeline** に置換。`derived_reads_ast.rs` の既存パターンを踏襲。
   upstream `server/visitors/*.js` をファイル単位で写経（多くは <50行）。shadowing は Phase-2 scope tree で解決。
2. **Step 2b: テンプレート式変換の単一 AST パス化**（§4 の本丸）。
   84箇所の `wrap_derived_reads`/`transform_store_refs` 呼び出しを**1つの AST 変換に統合**し、
   生の式 AST に対して derived-wrap + store-get + special-var を**一度だけ**適用。これで template currying と
   `$.stringify`/snapshot 系の多くが落ちる（はず）。**段階的 swap は不可** — まとめて置換。
3. **Step 1+3: 出力を oxc AST + esrap 一括印字へ**。`js_ast` IR を `oxc_ast::Program`（AstBuilder）構築に置換し、
   `rsvelte_esrap::print` で印字。`build.rs` の `normalize_script_with_oxc`/コメント hex 密輸/`esrap_layout.rs`/
   再インデントを削除。コメントは Phase-1 から position-sorted `Vec<Comment>` で printer に渡す（printer は対応済み）。
4. **Step 4: `async_body.rs::compute_blocker_map(raw_script)` を AST 解析へ**（Phase-2 メタデータと統一）。
   注意: メモ `feedback_has_call_semantics` — Phase-3 は「任意 CallExpression」、Phase-2 は「非 pure callee」で
   意味が異なる。混同すると runtime 回帰。
5. **Step 5: 仕上げ**。`grep -rn "JsStatement::Raw\|JsNode::Raw"` が printer の raw 対応以外で 0 になること。
   バイトスキャナ（`skip_string_literal` 等）の死蹟削除。新規 `Raw(`/バイトスキャン導入を弾く CI grep ガード追加。
   最終: コーパス 0件 + 全フィクスチャ + フルレビュー(major 0) + 全CIグリーン。

各ステップ後 `pnpm run test-and-update` で README/ダッシュボード更新。

---

## 8. 既にコーパスで残っている主なクラスタ（120件、参考）

- `$derived` currying のテンプレート側（TabItem/CloseButton/SectionHeader 等、~14件）→ Step 2b で解消見込み。
- `should_proxy`/`$.snapshot`/signal-bind getter-setter → Step 2 の単一パス化で正しく扱える見込み（地雷なので単独修正禁止）。
- クライアントのコメントストリーム（removed 文のコメントが次ノードへ再付着）→ Step 1+3（printer のコメント機構）で解消。
- ロングテールの個別差分。

`node scripts/compat-corpus/cluster.mjs` で最新の内訳を取得すること。

---

## 9. プロセス規律（ユーザー指示）

- メインは Opus、個別調査/修正は **Sonnet サブエージェントに明確な指示**で委譲してコスト最適化。
  ただし **成果物は必ずメインが diff レビュー + 中央でコーパス/ビルド検証**（サブエージェントは繊細な変換で
  誤診断・文書化済み決定の反転を複数回やらかした実績あり。§5）。
- リスキー領域（§5）はメインが直接、full fixture/CI 検証付きで。
- 「完璧な品質」優先 — グリーンな main を壊す変更は入れない。各ステップ常時グリーン。
- コミットは atomic、conventional commit、末尾に
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。push は CI 確認とセットで。
