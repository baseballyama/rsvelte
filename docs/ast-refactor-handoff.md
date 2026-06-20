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
    sequence/array/object/spread/await/void/arrow/**template-literal/tagged-template/assignment(識別子+非optional member)/update**）
    + 一般的な文（expression/return/var-decl(識別子のみ)/block/empty/debugger/throw/break/continue/if）。
    **対応拡大（burn-down 4スライス着地・各々 flag-ON byte-exact green）**: + assignment/update/template-literal/
    tagged-template + function-expr/chain/import-expr/regex + **import/export/function-decl 文**（実コンポーネント解放）
    + **制御フロー文 for/for-of/for-in/for-await/while/do-while/switch/labeled/try**。
    **さらに着地（burn-down 計6スライス、各々 flag-ON byte-exact green）**: + **分割代入 binding pattern**
    （object/array/rest/default/hole/nested、var-decl/params/for-of/catch、共有 `binding_pattern` helper）
    + **yield / private-field member(`obj.#x`) / object property の method/getter/setter/computed**
    （codegen の `auto_method` 規則を再現）。
    **+ Class（メソッド/フィールド/computed key/super、static-block と decorator は bail）+ assignment-target 分割代入**
    （`[a,b]=x` / `{a}=x`、IR は Array/Object 式を pattern 位置で再利用、oxc `Array/ObjectAssignmentTarget` 構築）。
    **→ converter は variant-complete。全 JS 構文を byte-identical に変換可能。残る bail は `Raw`/`Spanned`/`RawMapped`（不透明テキスト）のみ。**
    各スライスは subagent に `to_oxc.rs` の variant 追加を委譲 → メインが diff レビュー + 中央 byte-exact 検証
    （`RSVELTE_CLIENT_TO_OXC=1 cargo test --release --test runtime --test compiler_fixtures`、flaky bin はリトライループ）→ commit。
    **Raw-elimination フェーズ開始済み**（client Raw 59→56）: 第1スライスで `expression_converter.rs` の
    リテラル逐語保存 Raw 3個（二重引用符文字列・非正規数値 `1_000_000` 等）を構造化
    `JsLiteral::RawString{value,raw}` / `RawNumber{value,raw}`（codegen は raw 逐語出力＝旧 Raw とバイト一致、
    to_oxc は oxc literal の raw 経由）に置換。**★Raw-elim スライスの検証は二重★**: IR + codegen を触るので
    **flag-OFF（codegen 不変＝コーパス 120 no-NEW + byte-exact fixtures）と flag-ON（to_oxc が新ノードを処理）の両方**を検証する
    （to_oxc-only スライスは flag-ON だけで済んだが、Raw-elim は codegen も変えるため flag-OFF も必須）。
    残 client Raw クラスタ（構築箇所、~56）と**精査済みの性質（重要：mechanical ではない）**:
    - **`declarations.rs`(2) / `program.rs`(2)＝load-bearing opacity**: `JsExpr::Identifier(name) => JsExpr::Raw(name)`。
      これは setter callee を `apply_transforms_to_expression` の prop-read 変換（`x→x()`）から**不可視にする意図**
      （コメント明記。Identifier に戻すと `x(value)`→`x()(value)` に二重変換し回帰）。構造化するには
      **`apply_transforms` がスキップする「不変 Identifier」**を導入する（例: `JsExpr` に opaque-identifier 概念追加、
      apply_transforms で Raw 同様スキップ、codegen/to_oxc は Identifier として扱う）。IR 追加＋apply_transforms/codegen/to_oxc 4点。
    - **`const_tag.rs`(2) / `declaration_tag.rs`(3)＝文字列組立の文**: `Raw(format!("const {} = {};", pattern_str, init_str))`,
      `Raw(rhs)` 等。pattern_str/init_str/rhs を**構造化（JsStatement::VariableDeclaration / 構造化 init）**するには
      上流の文字列生成を構造化ノードに置換要。
    - **`shared/component.rs`(4) / `bind_directive.rs`(14)＝手書き arrow getter/setter（最難）**: 本体が文字列。
      `JsExpr::Arrow` + 構造化 body に分解。setter_body/getter 文字列の生成元から構造化が必要。
    - **`shared/utils.rs`(3)**: `Raw(collection_expr)`（each コレクション式の生テキスト）等＝任意式テキスト。
    - **`mod.rs`(11) / `await_block.rs`(4)**: 未精査。比較的 mechanical なものがあるか次セッションで grep 精査。
    - **`expression_converter.rs`(残11)**: 多くは `/* Unknown */`/`/* Array */`/ChainExpression-missing 等の**到達しない fallback**
      ＝リアルプログラムを塞がない（converter が bail しても実害なし）→優先度最低。`pattern_to_string`(2) は分割代入を式位置で
      文字列化＝to_oxc の pattern 処理を流用して構造化可能。
    **★★ 重要な構造的発見（全体像）★★**: `mod.rs` の Raw/RawMapped の大半は **instance/module script 変換結果
    （`transform_script.rs` の テキストパイプライン出力）を不透明テキストとして IR に運ぶ境界** + 先頭コメント
    （`/* … generated by Svelte */`）。`await_block.rs`/template 由来の Raw もテンプレート式テキストの境界。
    **つまり残 client Raw の多くは「個別に構造化」できず、その INPUT を生む 2 つの大仕事に律速される**:
    - **Step 2: script 変換の AST 化**（`transform_script.rs` の store/remove_rune/class_fields 等の残テキストパス。
      session 序盤で derived read/update/assignment/thunk は AST 化済みだが、残りは未。これが終わるまで mod.rs の
      script-block Raw は消せない）。これは Step 3 と並ぶもう一つの multi-week 本丸。
    - **コメントストリーム**（先頭コメント等。`Root.comments` → `print_with_hooks`）。
    → **to_oxc 出力 converter（Step 3）は完成したが、その入力（script 変換・テンプレート式）はまだテキスト**。
    「flag を ON にして codegen 削除」の最終ゴールには **Step 2 完了 + コメントストリーム**が必須。
    **当面構造化できる残 Raw（Step 2 非依存）**: output-IR 構築の文字列組立（bind_directive/component の getter/setter arrow、
    const_tag/declaration_tag の宣言文）。これらは upstream の文字列生成を構造化ノードに置換すれば消せる（intricate, 1クラスタずつ dual 検証）。
    **総括**: literal-spelling/opaque-ident（済）以外の残 Raw は (a) 文字列組立 output-IR（構造化可、intricate）か
    (b) script/template テキスト境界（Step 2/コメントに律速）。mechanical な一括処理は不可。
    **次フェーズ（flag を ON にする前の本丸）**: (a) Class + assignment-target 分割代入は**追加済み**、(b) **client visitor が生成する
    ~191 個の `Raw(...)` を構造化ノードに置換**（structured な式/文を Raw 文字列で組み立てている箇所＝
    bind_directive.rs の手書き arrow、bridge.rs の SSR テンプレ等。これが減るほど converter が `None` で codegen に
    fallback せず direct-AST で出せるプログラムが増える）、(c) **コメントストリーム**（Phase-1 `Root.comments` →
    `rsvelte_esrap::print_with_hooks` の `get_leading`/`get_trailing`。現状 converter は synthetic Program でコメント無し＝
    コメント付きプログラムは codegen fallback に頼っている可能性。要 hooks 実装）。(a)(b)(c) が揃ったら
    `RSVELTE_CLIENT_TO_OXC` を**既定 ON** に反転 → `js_ast::codegen`(3305行) と client/formatting 後処理を削除 →
    client がテキスト codegen ゼロ・完全 AST ベースに。
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

## 0b. 現在の状態（2026-06-20: big-bang リライト方針へ転換）

**ユーザー指示の更新（重要）:** 「一時的な大規模リグレッション/大量のコンパイルエラーは許容。既存のテキストベース処理は
即座に全削除し、"あるべき理想の AST ベース処理"（upstream visitor 構造の写経 + oxc AST 構築 + esrap 印字）に置換せよ。
まずコンパイルを通し、その後コーパスで1個ずつ正す。既存テストは移植困難なら破棄可。可能な限り並列（エージェント10〜20）。」
→ 漸進的 flag-gate 戦略から **big-bang リライト** に転換。

- **新ワークツリー**: `/Users/baseballyama/git/rsvelte-ast-full`、**ブランチ `feat/phase3-ast-full`**（main `a93f50c0` から作成）。
  以後の作業はここ。`rsvelte-ssr-esrap`/`feat/phase3-ast-refactor` は旧・漸進戦略のもので、本方針では使わない。
- **環境セットアップ済み**: pnpm install / svelte submodule + deps / `node scripts/fixtures/generate-fixtures.mjs` 完了。
  コーパスの重いサブモジュール（svelte.dev/bits-ui 等）は未取得（コーパス検証する段階で `§1` の手順を実行すること）。
- **シードの目標 seam（不変）**: `transform_component(analysis:&ComponentAnalysis, ast:&Root, source:&str, options:&CompileOptions)
  -> TransformResult` と `transform_module(...)`（`3_transform/mod.rs`）。client は `transform_client`、server は `transform_server`。

### ✅ 着地（PR 未・ローカルコミット `6dc5819a`、build/test green）
- **基盤①: `b.*` ビルダー層** `crates/rsvelte_core/src/compiler/phases/3_transform/builders.rs`（`phase3_transform::builders`）。
  upstream `utils/builders.js` の Rust ポート。`B<'a>`（`AstBuilder<'a>` の Copy ラッパ）。`id/member/member_id/call/call_opt/
  new/literal群/operator群/array/object(+init/get/set/spread)/arrow/thunk(0引数 unthunk 畳み込み)/function_declaration/
  const|let|var/制御フロー文/template/program`。**全構築パターンは `js_ast/to_oxc.rs`（variant-complete・oxc 0.136）から逐語移植**
  ＝esrap でバイト一致が保証される。**検証**: `cargo test -p rsvelte_core --lib phase3_transform::builders::tests` 7/7 green
  （各テストが `B` で式/文を組んで `rsvelte_esrap::print` し出力文字列を assert）。

### ★ 完成した地形マップ（8 エージェント調査・本リライトの設計入力）★
- **upstream の移植先**:
  - server `3-transform/server/`: entry `transform-server.js`(430行・`server_component`/`server_module`) + visitors 38ファイル
    (~3.6k行)。global_visitors(script: VariableDeclaration/CallExpression/AssignmentExpression/Identifier/UpdateExpression/
    LabeledStatement/Program/ClassBody/…) + template_visitors(Fragment/RegularElement/EachBlock/IfBlock/AwaitBlock/Component/
    SvelteElement/…) + shared(element.js 561/component.js 359/utils.js 417=process_children/build_template/PromiseOptimiser)。
  - client `3-transform/client/`: entry `transform-client.js`(709) + visitors ~60ファイル(~7.6k行)。RegularElement 747・
    EachBlock 362・VariableDeclaration 429・shared/component 536・shared/utils 517 が大物。
- **印字ターゲット = `rsvelte_esrap`（完成済み, oxc 0.136）**: `print(&Program, source:&str)->String` /
  `print_with(.., &PrintOptions)` / `print_with_hooks(.., &CommentHooks)`（`get_leading`/`get_trailing` で synthetic comment 注入）。
  Program 構築は `AstBuilder::new(&Allocator)` → `b.*` 経由。`source:&str` はコメント補間に使う（構築 AST なら `""` で可）。
- **rsvelte 側の入力（移植元データ）**:
  - **script は oxc ではなく rsvelte 独自 `JsNode`**（`ast/typed_expr.rs`, 60+ variant）が `Root.arena: ParseArena` に格納。
    `Root.instance`/`module: Option<Box<Script>>`、`Script.content: Expression`（`Expression::Typed(TypedExpr{node:JsNode})`
    か `Value(serde_json)` か `Lazy{start,end,ts}`）。**現 Phase-3 はこの AST を使わず source テキストを再パースしている**。
    → **基盤②が必要: `JsNode -> oxc Expression/Statement` 変換器**（`js_ast/to_oxc.rs` の JsExpr->oxc と同型・逐語パターン流用）。
    あるいは既存 `client/visitors/expression_converter.rs`(JsNode->JsExpr) + `to_oxc`(JsExpr->oxc) の2段を server でも再利用。
  - **template は `TemplateNode` enum**(~28 variant, `ast/template.rs`)。`Fragment.nodes: Vec<TemplateNode>`。
    埋め込み式は `Expression`(=JsNode)。属性/ディレクティブは `Attribute` enum（Bind/On/Class/Style/Transition/Animate/Use/Let/Spread/Attach）。
  - **Phase-2 `ComponentAnalysis`**(`2_analyze/types.rs:1671`): `root: ScopeRoot`(`bindings:Vec<Binding>` flat + `all_scopes`),
    `Binding.kind: BindingKind`(State/RawState/Derived/Prop/BindableProp/RestProp/StoreSub/LegacyReactive/EachItem/Snippet…),
    `root.get_binding(name, scope_idx)`. `reactive_statements`, `exports:Vec<Export{name,alias}>`, flags
    (`uses_props/uses_rest_props/uses_slots/needs_props/needs_context/uses_component_bindings/props_id/custom_element/
    inject_styles/css.hash`). **gap: `css.ast` は未保持**（必要なら別途）。`instance_body.hoisted` は JSON(現状未活用)。
  - **既存 client framework は table-driven ではなく手書き再帰下降**: `ComponentContext::visit_node`(types.rs:85) の巨大 match +
    `ComponentClientTransformState`(init/update/template/hoisted/consts/let_directives バッファ + memoizer + transform map)。
    visitor は戻り値ではなくバッファに `JsStatement`/`JsExpr` を push。→ **server リライトも同型の手書き再帰下降にし、
    出力を `b.*`(oxc) にする**のが最善（zimmerframe 汎用 walker を新規構築する必要はない、というのが調査の結論）。

### ★★ 決定的アーキ知見（2026-06-20, 基盤②着地で判明）★★
**rsvelte の parse-phase `JsNode` 表現は LOSSY**＝完全な AST ではない。`1_parse/read/expression.rs` の `_for_program`
lowering が以下を **opaque `JsNode::Raw`(serde_json) に退化**させて格納する: **ブロック本体アロー** `() => { … }`
(8159)、**関数式** `function(){}`(8179)、**分割代入ターゲット** `[a]=x`/`{a}=x`(9309)、**`export` 宣言**(6580)、
**bigint** は variant 無しで `identifier("unknown")` に退化(8828)。
→ **含意（重要）**: スクリプト/テンプレ式の変換に parse-phase `JsNode` を使うと、これらの一般形（特にイベントハンドラの
ブロックアロー `onclick={() => {…}}`）で **fidelity を失う**。したがって本リライトの **第一級の JS 取得戦略は
「ソーススパンを oxc Parser で再パースして faithful な oxc AST を得る」**こと（＝現 Phase-3 が script で既にやっていること、
`server/build.rs:62` の `Parser::new(&alloc, &stripped, mjs).parse()`）。**これは「テキスト処理」ではない**＝入力をパースして
AST 化するのは正当（ゴールが禁じるのは OUTPUT JS を文字列操作すること: byte-scanner / 文字列連結 / Raw 密輸）。
`jsnode_to_oxc`（基盤②, 18/18 green）は **lossy でないケース専用の補助**として残す（テンプレ単純式の高速路 / 参照実装）。
**変換の本体は oxc AST 上で行う**（upstream が ESTree を直接 transform するのと同型）。oxc AST の変換機構は
`oxc_ast_visit`(Visit/VisitMut) または手書き再構築（`b.*`）。`derived_reads_ast.rs` の既存 AST 編集パスも参照。

### ★★★ 核心メカニズム確定（2026-06-20, spike で実証）★★★
**禁止: span-driven string splice。** コードベース既存の 38 個の `*_ast.rs`（`shared/ast_rewrite.rs` の `with_program`+`splice`、
immutable `Visit` で `(start,end,replacement)` を集めソーステキストを `replace_range`）は **AST 駆動だが OUTPUT は文字列編集**＝
**ゴールが禁じる「テキスト処理」そのもの**（handoff が「最終形ではない」と明記）。**サブエージェントが「これを使え」と推奨してきても却下せよ。**
**oxc 0.136 に `VisitMut`/`oxc_traverse` は無い**（`oxc_ast_visit` は immutable `Visit` のみ）。
**確定アプローチ（spike `builders.rs::spike_inplace_oxc_mutation` で実証・green）**:
1. **入力**: スクリプト/テンプレ式の**ソースを oxc Parser で faithful にパース**（`Parser::new(&alloc, src, mjs).parse()` → `ret.program`、
   エラーは `ret.diagnostics`）。lossy な parse-phase JsNode は使わない。
2. **変換**: **oxc AST を `&mut` 手書き再帰下降で in-place mutate**（`program.body.iter_mut()`, `&mut Expression`,
   `call.callee = b.id("$.state")` 等の代入で置換）。`oxc_allocator::Box`/`Vec` は `&mut` 経由で書き換え可能と実証済み。
   ノード新規構築は `b.*`(builders.rs)。`std::mem::replace` で式まるごと差し替えも可。
3. **出力**: `rsvelte_esrap::print(&program, src)` で一度だけ印字。
→ これで「テキスト処理ゼロ」を満たす。upstream の zimmerframe walk+return-replacement と同型（in-place mutate 版）。

### 進捗（2026-06-20, feat/phase3-ast-full・全 green・oracle 検証済み）
`transform_server`（既存テキスト版＝SSR フィクスチャ全通過＝**正しい**）を **oracle** として、新 `server/ast/` の出力を
正規化比較する gate を確立。これで visitor port が安全＆並列化可能に。**コミット列**: builders → jsnode_to_oxc → doc →
mutation-spike → server-skeleton → template-framework → block-visitors。
- ✅ **server skeleton** `server/ast/mod.rs`: `ServerTransformState<'a>{b,analysis,options,hoisted,body,template,each_index,…}`
  + `server_component_ast(...)`（hoisted import + `export default function Name($$renderer,$$props){props prologue + template}`）。
  実 parse+analyze ハーネスでテスト。**`transform_server` は未接続**（並行・無変更）。
- ✅ **template framework** `server/ast/visitors/shared.rs`: `process_children`/`build_template`/`build_fragment_body`/
  `build_fragment_block`（upstream 写経）。`TemplateEntry=Literal|Template|Stmt`、隣接静的を 1 つの ``$$renderer.push(`…`)`` に
  coalesce、`{expr}`→`${$.escape(expr)}`。`visit_expr`=jsnode_to_oxc + span 再パース fallback。
- ✅ **visitors（oracle byte 一致）**: RegularElement(静的/boolean 属性)・Text/Comment/ExpressionTag・HtmlTag・
  IfBlock(`<!--[n-->` マーカー, else-if chain)・EachBlock(`$.ensure_array_like`+for, sync/unkeyed)・KeyBlock・SnippetBlock(hoist)・
  AwaitBlock(sync)。**注**: テキスト oracle は block 本体を 1 タブ浅く出力するが esrap は正しくインデント→corpus の oxfmt が吸収
  （AST 版が正しい）。block テストは indent 非依存比較。
- **KNOWN GAP（未 port）**: 全 async path(`create_child_block`/PromiseOptimiser/blockers)・keyed/animated each・each `{:else}`・
  Component・SvelteElement/Head/Fragment/Boundary・SlotElement・RenderTag・SpreadAttribute・動的/directive 属性・
  `<select>/<option>/<textarea>` 特殊・dev マーカー。**そして最大の本丸＝instance/module script の rune lowering(下記)**。

### ★ 次の本丸: instance/module script transform（最delicate・最大のテキスト削除＝transform_script.rs 8.4k 行）★
現状 `server_component_ast` は **instance body 空**＝`<script>` ロジックを持つコンポーネントは oracle 不一致。これを埋めるのが
最大の勝ち。**やり方（§核心メカニズム + §4 厳守）**: スクリプトを oxc 再パース → **in-place `&mut` mutate** で rune lowering
（`$state(x)`→`$.state(x)`, `$derived(e)`→`$.derived(()=>e)`, `$props()` 分割, store `$x`→`$.store_get`, `$effect`/`$inspect` 除去,
legacy `$:`）。**§4 の決定的知見厳守**: derived/store/special-var は **生の式 AST に一度だけ**適用する単一パス（多段 wrap は
二重化回帰）。**§5 地雷**（snapshot 意味論・each_array 連番・should_proxy）は単独で触らない。**delicate ＝ サブエージェント
丸投げ禁止、メインが直接 + oracle 全 SSR フィクスチャ検証**。これが通れば `transform_server` を新 pipeline に接続 →
`transform_script.rs`/`build.rs`/`helpers.rs`/`transform_store.rs`/`bridge.rs`/`esrap_layout.rs` を削除。

### 次の作業順（big-bang・常時コンパイル可能を維持しつつ）
1. ✅ **基盤②: `JsNode -> oxc` 変換器** `3_transform/jsnode_to_oxc.rs`（`jsnode_to_oxc_expr`/`_program`/`jsnode_stmts_to_oxc_program`、
   `Cx{ab,arena}`、`Option` 返し）。`to_oxc.rs` 逐語移植。**18/18 esrap round-trip green**（rsvelte 自身の `parse_program_with_error`
   でパース→変換→`rsvelte_esrap::print`→byte 比較）。bail: Raw/Class*/StaticBlock/Decorator/TS-only/bodyless-fn/re-export。
   ※テストは `with_serialize_arena(&arena, …)` 内で実行要（さもないと arena が空に見える, `1_parse/mod.rs:194` 参照）。
2. **server スケルトン**: `ServerTransformState`(oxc allocator/B + hoisted/init/template バッファ) + `server_component`/`server_module`
   を upstream `transform-server.js` 写経で構築。visitor は最初 stub（`b.empty()` 等）でコンパイルを通す。`transform_server` を接続。
3. **旧 server テキストモジュール削除**: transform_script.rs(8.4k)/build.rs テキストパス/helpers.rs バイトスキャナ/transform_store.rs/
   bridge.rs/esrap_layout.rs。削除でコンパイルエラー大量 → スケルトン + stub で通す。
4. **server visitor 並列ポート**: upstream 38ファイルを `b.*` で1つずつ写経（10〜20 並列、メインが diff レビュー + コーパス検証）。
5. **client**: js_ast `Raw` 全廃 → `to_oxc` 経由に一本化 → `codegen.rs`(3.3k) 削除。
6. **shared**: `async_body.rs::compute_blocker_map(raw_script)` を AST 化。
7. **仕上げ**: `grep` で Raw/バイトスキャナ 0 を CI ガード化。コーパス green。`pnpm run test-and-update`。

**検証ゲート**: byte-exact は `cargo test --release --test runtime --test compiler_fixtures`（`ssr`/`snapshot` 単一ターゲットは無い、
`ssr_*` 個別）。コーパスは `§2` 手順（重いサブモジュール取得後）。**ビルドは必ず1本ずつ**（`§2 教訓1`）。

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
