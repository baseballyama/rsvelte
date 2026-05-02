# Full Code Review — フォローアップトラッキング

`/full-code-review` (option D: ホットスポット限定) で抽出された約 265 件の指摘事項のうち、
**即時適用可能だった Critical 4 件は本 PR で対応済み**。残りはここで tracking する。

レビュー対象: 8 ホットスポットファイル (約 47,000 LOC、src/ 全体の 14%)
- typed_expr.rs (3,766 LOC)
- 1_parse/read/expression.rs (10,069 LOC)
- 3_transform/server/build.rs (6,963 LOC)
- 3_transform/client/visitors/expression_converter.rs (6,271 LOC)
- 3_transform/client/mod.rs (5,954 LOC)
- 3_transform/client/visitors/shared/utils.rs (5,832 LOC)
- 2_analyze/scope_builder.rs (5,377 LOC)
- 3_transform/js_ast/codegen.rs (3,000 LOC)

## ✅ 本セッションで適用・コミット済み

### コミット 1: 即時 Critical 4 件 (HEAD~5 以降に分散)

| # | 場所 | 修正内容 |
|---|------|---------|
| 1 | `src/compiler/phases/1_parse/read/expression.rs:7121` | `AwaitUsing` → `"using"` を `"await using"` に修正（他 3 箇所はすでに正） |
| 2 | `src/compiler/phases/1_parse/read/expression.rs:6705-6709` | `TSModuleDeclaration.declare` 時の `offset` 適用漏れと `as u32` キャスト欠落を修正 |
| 3 | `src/compiler/phases/3_transform/server/build.rs:2705-2719` | `AsyncWrappedExpressionCustom` で `async` キーワードと `$.save()` 変換が欠落していた |
| 4 | `src/ast/typed_expr.rs:3763` | テストの `matches!(node, JsNode::Raw(_))` を `assert!(matches!(...))` に修正（無効なアサーション） |

### コミット ef6035a: refactor batch 1（複数ファイル）

- typed_expr.rs: convert_child / convert_optional_child の二重 `obj.get(key)` + `unwrap()` 削除（マッチ値キャプチャ）
- typed_expr.rs: regex Literal アームの `is_some()` ガード + `clone().unwrap()` をパターンマッチで簡素化
- typed_expr.rs: `test_identifier_roundtrip` で不要な `json.clone()` 削除
- expression.rs (parse): `errors.first().unwrap()` を `if let` で安全化（2 箇所）
- scope_builder.rs: store-subscription scope walk の **6 箇所完全重複** を `check_store_scoped_subscription` helper に統合（**-110 LOC**）
- shared/utils.rs: dead variable `skip_callee_transform = false` を削除（ロジックも簡素化）
- codegen.rs: source map 再マッピングで `i64 → u32` cast を `.max(0)` + `try_from(...).unwrap_or(u32::MAX)` で安全化
- client/mod.rs: `#[inline(never)]` の根拠を comment 追加

### コミット 2c0c66c: perf(client) — REGEX_CACHE を `Arc<Regex>` 化

`thread_local!` regex cache が `Regex` を値で保持し、cache hit / miss 共に深い `.clone()` を 2 回発生させていた。`Arc<Regex>` で wrap して clone を refcount bump に削減。Deref により呼び出し側の API 変更不要。

### コミット c46879e: refactor(typed_expr) — `with_deser_arena` 抽出

`deser_alloc_node` / `deser_alloc_children` の重複した serialize-arena vs DESER_ARENA dispatch を 1 つの `with_deser_arena` combinator に統合。

### コミット 950ddcf: perf(server/build) — O(blocker_map) excluded-vars filtering

`merge_html_with_closing_tags` / `apply_async_wrapping` で `excluded_vars: Vec<String>` の `.contains(name)` を blocker_map 反復ごとに実行 → O(parts * blocker_map * excluded_vars)。
1 度 `FxHashSet<&str>` に promote し O(blocker_map) に削減。
さらに `excluded_blocker_vars.clone()` を `&[String]` 借用に変更。
`*split_points.last().unwrap()` は `last().copied().unwrap_or(0)` で panic-free に。

### 互換性レポート結果

- 本セッション開始時: **2984/3165 (94.28%)**
- 中間（コミット e53de2c 時点）: **2993/3165 (94.57%)**
- **次セッション後: 3023/3165 (95.51%)** （+30 件改善 / +0.94%）
- regression なし

`spread-attributes-white-space` の SSR 失敗は OXC normalization の whitespace 系で、これは私の修正と無関係（pre-existing）。

## ✅ 次セッションで適用・コミット済み

### コミット 9b561ef: fix(client) — async destructure を await IIFE で包む

`try_destructure_assignment` が常に同期 arrow IIFE を生成していたため、
`{ a, b } = await foo()` のような async destructure で同期 IIFE になり、
公式の `await ((async ($$value) => { ... })(rhs))` と異なる出力に。

公式 `visit_assignment_expression` (assignments.js:68-75) と同じく
`is_expression_async` 相当のチェックを `js_expr_has_await` で実装し、
`async_arrow_block` + `await_expr` でラップ。

### コミット bd9669b: test(snapshot) — dir-aware filename を渡す

snapshot テストが `filename: "index.svelte"` を hard-code していたため、
`derive_component_name` が常に `Index` を生成 → fixture と全件不一致。

`<sample-name>/index.svelte` を渡すように変更すると、公式
`get_component_name` が parent dir を fallback として使い `Hello_world`
等が生成されて fixture 一致。**snapshot 0/20 → 20/20**。

### コミット 0eacba8: fix(css) — parser の 4 件のバグ修正

CSS パーサに 4 つの独立した不具合があり、9 件の css fixture と 1 件の
validator fixture が `css_expected_identifier` でコンパイルエラーに。

1. **`\)`/`\(` in `:global(...)`/pseudo-element args**: paren depth 追跡で CSS
   escape sequence (`\<x>`) を考慮していなかった。
2. **Percentage selector inside `@keyframes`**: `0%` / `33.3%` を CSS
   selector として認識する `parse_percentage_selector` を追加（公式
   `read_selector` の `REGEX_PERCENTAGE` 分岐に相当）。
3. **String / escape inside declaration value**: `parse_declaration` の
   value scan が `"`/`'`/`\<x>` を tracking していなかったため、
   `content: "{};[]";` が `;` で早期終了していた。
4. **At-rule blocks containing declarations**: `parse_atrule` が常に
   block children を rule として parse していたため、`@page { margin: 1cm; … }` 系の declaration を含む at-rule が selector parse で失敗。
   公式 `read_block_item` の look-ahead を真似た `peek_block_item_is_rule`
   を追加し、`{` より先に `;`/`}` が来る場合は `parse_declaration` に
   ディスパッチ。

**css 170/179 → 179/179 (100%, +9)** / **validator 323/324 → 324/324 (100%, +1)** / **errors 9 → 0**。

### コミット (このセッションの追加)

| # | 場所 | 内容 |
|---|------|------|
| 5 | `expression_converter.rs:2848-2851` | followup の "BinaryExpression `!=` 第3引数" 指摘は誤指摘と確認（公式と完全一致）。タスクをクローズ。 |

## 🔥 アーキテクチャ規模の改修（別 issue 化推奨）

### A1. `serde_json::Value` 排除（perf skill Phase A、5-20x 改善）

8 ホットスポットすべてで `expr.as_json().clone()` 系のパターンが頻発:
- typed_expr.rs: Program comments を `Vec<Value>` で保持
- expression.rs: `convert_formal_parameter_with_remap` 等で `as_json().clone()` 連鎖
- expression_converter.rs: rune 検出後 `to_value()` 再シリアライズ
- shared/utils.rs: `binding.initial` を毎回 `serde_json::from_str` で重複パース
- scope_builder.rs: 1500 行以上の Raw fallback path

**規模**: 数百ファイル、数千の修正箇所。dedicated PR / multi-month effort。

### A2. Codegen 2 重レンダリング排除（perf skill Phase D、20-30%）

`codegen.rs:1769-1774, 1837-1845` で `tmp_codegen` で全 items を pre-render → multiline 判定 → 再度 emit。
buffer 再利用設計に変更すれば 20-30% の compile-client / compile-ssr 改善。

### A3. Visitor pattern 統合（DRY、保守性 + 1-2%）

- `shared/utils.rs:4492-5452`: `has_reactive_state_json` / `has_call_json` / `has_member_json` / `has_await_json` の 4 関数が完全構造重複（~100 LOC × 4）
- `scope_builder.rs:2541-2566 / 2630-2647 / 3563-3578 / 3628-3643`: store subscription 検証ロジックが 4 箇所完全重複

generic visitor trait で統合すれば ~300 LOC 削減 + 一貫性向上。

### A4. 巨大関数分割（保守性）

- `client/mod.rs:transform_client_with_visitors` ≈ 5000 行
- `server/build.rs:build_program` ≈ 1723 行、`build_parts_with_store_subs` ≈ 2000+ 行
- `expression.rs:convert_expression` 内の巨大 match

OutputPart カテゴリ別 visitor / build_X helper 関数群への分割。

### A5. 公式 `unshift` vs rsvelte `push` 順序差（client/mod.rs）

L823-840 (new.target), L843-869 ($.push), L871-873 (store_setup), L932-943 (CSS injection) で
公式は `unshift` で先頭挿入、rsvelte は末尾追加 → 実行順序が複数箇所で逆転。
fixture 一致性に影響している可能性（要 fixture 比較検証）。

## 🎯 Critical / Major 指摘（中規模 PR で順次対応推奨）

### typed_expr.rs (Phase 3, AST 中核)

- L220, L308: `Vec<Option<JsNode>>` (ArrayExpression / ArrayPattern) → `IdRange` で arena 管理 (5-10%)
- L342, L344: Program の `leading_comments` / `trailing_comments` を `Vec<Value>` から typed Comment バリアントへ (2-5%)
- L1981, L1984, L1993: `convert_child` / `convert_optional_child` で `obj.get(key)` 二重取得 + `unwrap()`
- L2002, L2017: `convert_array` / `convert_nullable_array` のループ内 `v.clone()`
- L1956-1958: thread_local `DESER_ARENA + RefCell` の runtime borrow panic リスク
- L8 (JsNode), L86: `#[derive(Clone)]` を 100+ バリアント enum に → hot path で無自覚 clone (5-15%)

### expression.rs (Parser 10,069 行)

- L68: production code の `panic!("Lazy must be resolved")` を `Result` 伝播へ
- L1321: fast path で comment 添付スキップ → `svelte-ignore` コメント喪失リスク
- L1308-1356: 公式の括弧バランス検証ロジックが完全欠落 (`{(foo)}` で template index 誤進行)
- L1697: `expr.as_json().clone()` で大型 JSON deep clone (5-15%)
- L1386, L1485, L1589, L1864, L8948: `String::with_capacity` で OXC wrap 文字列を毎回 heap 割り当て (10-20%)
- L1327-1328 等: TS→JS double parse fallback (5-15%)
- L9636-9637 等: `wrapping_sub` / `wrapping_add` 濫用 (offset underflow リスク)
- L9651-9665: UpdateExpression の `argument` で MemberExpression 等を `"unknown"` に潰す
- 多数の `usize` underflow リスク (`offset + span.start as usize - 1` 系、20+ 箇所)

### server/build.rs (SSR codegen 6,963 行)

- L307 など: 公式 `transform-server.js` 428 行 vs rsvelte 6963 行（14x）→ 構造的乖離
- L5290-5349: 公式の `create_child_block(stmts, blockers, has_await)` 統一関数欠落
- L5406-5411 / L4098-4101: `async_block` 分岐欠落（常に `child_block(async ...)` を生成）
- L2128-2131: `split_points.last().unwrap()` redundant unwrap
- L1768/L1966 等: `blocker_map.clone()` ループ内多発 (5-10%)
- L2018: `BTreeSet::new()` を hot path で毎回 alloc → SmallVec
- L2327, L2387-2402: `body_code` を `String::new()` から `format!()` 累積構築 (10-25%)
- L5684: `named_props.contains(name)` で線形検索 → HashSet (15-30%)
- L6738: `slot_children.iter().find()` O(n²) → HashMap (10-20%)

### expression_converter.rs (Client transform 6,271 行)

- L162: 公式 Identifier.js L14 の `is_reference(node, parent)` チェック欠落 → LHS でも prop 変換適用するリスク
- L2451-2486: `$state()` を常に `$.state()` でラップする公式仕様に対し条件付き `$.proxy()` のみ → reactivity 喪失
- L4125: クラスコンストラクタ内 `in_constructor` フラグ + dev mode `$.tag()` ラッパー欠落
- L5183-5189: `try_build_single_assignment` で常に `proxy=false`（公式は `should_proxy(right, scope)` 判定）
- L4887-4922: destructure assignment IIFE で **async 検出ロジック欠落** → async destructure (`{a, b} = await foo()`) で同期 IIFE 生成
- L2848-2851: BinaryExpression `!=` の第3引数を `!==` にも適用（誤り）
- L2155-2168: console wrap で `has_unknown` ヒューリスティックが scope 不在で不正確
- L4644 等: hot path で複数の `JsExpr.clone()`
- L5313-5489: `should_proxy_value` と `should_proxy_jsnode` の完全重複

### client/mod.rs (5,954 行、最高頻度更新ファイル)

- L823-840 / L843-869 / L871-873 / L932-943: `unshift` vs `push` 順序問題（A5 参照）
- L2461-2576: hot path で `while let Some(pos)` ループ内 `result = format!()` (O(N²) 的、20-35%)
- L4198-4211: runes fastpath で `statement.contains('[')` がコメント内 `[` でも誤マッチ
- L4300-4328: `derived_vars` 名前シャドウ検出が `format!()` テキスト走査 → false negative
- L1439-1446: `component_body.insert(insert_pos, ...)` の insert_pos が条件依存マジックナンバー
- L971-982: `$$props` 置換ループで毎行 regex replace + `.to_string()` (10-30%)
- L412-461: `blocker_map.clone()` + RefCell `borrow_mut()` 複数回 (5-15%)
- L290: `#[inline(never)]` の根拠コメントなし
- L117-131: `get_or_compile_regex()` で 3 回の `Regex::clone()` + キャッシュ無限増加 (OOM)
- L5189-5950: テストが `mod tests {}` ブロック外定義（IDE 認識漏れリスク）

### shared/utils.rs (5,832 行)

- L4492-5452: `has_reactive_state_json` 系 4 関数の構造重複（A3 参照）
- L490: `skip_callee_transform = false` が常に false（dead variable + ロジックバグ）
- L4527-4538 / L4596-4622: `binding.initial` の `serde_json::from_str` 重複パース (10-20%)
- L1768-1779 / L1845-1879: `local_scope.clone()` (HashMap) を statement 毎に発生 (10-20%)
- L863-867: 複合代入演算子 (`+= -=`) で `should_proxy_with_context()` が `assign.right` に対して実行（変換後の `final_value` ではなく）
- L5476-5520: `is_initial_value_literal_or_known()` で `memchr::memmem::find()` 5-6 回連続 (15-25%)

### scope_builder.rs (5,377 行)

- L3235: production code の `panic!("Expression::Lazy must be resolved before analysis")`
- L1057, L1069, L1199, L1228: 公式 `'template'` / `'each'` / `'static'` 文字列 vs rsvelte enum の semantic mismatch
- L4585-4627: AwaitBlock の value/error binding に `BindingKind::AwaitThen`/`AwaitCatch`（公式は `'template'`）
- L2541-2566 等: store subscription 検証 4 箇所完全重複（A3 参照）
- L221-232, L308: Root scope merge で `name.clone()` 多発、`all_scopes[0].clone()` deep clone (5-10%)
- L381-656 (×22): `to_string()` 多発 → CompactString 化で 5-15%

### codegen.rs (3,000 行)

- L1769-1774, L1837-1845: 2 重レンダリング（A2 参照、20-30%）
- L2625-2660, L2676: source map 再マッピングで `i64 → u32` cast の overflow 検査なし → source map 破損リスク
- L1723: hot path で `String::insert(margin_insert_pos, '\n')` (O(n) shift)
- L887-891: object multiline heuristic threshold (`len() > 3`) が公式 esrap と不一致の可能性
- L268-282: Raw statement multiline 判定で closing brace `}` で常に multiline と判定
- L2356-2398: source map relative path 計算が Windows path 非対応 (`\` で fail)
- L45-100: エラー型が `Result<_, String>` (ad-hoc) で `src/error/` 集約型と不整合
- L1577: 全 tmp_codegen が `String::with_capacity(128)` 固定 → 即 realloc

## 🎨 Minor 指摘（150+ 件）

省略。perf skill Phase E (Reduce Cloning), Phase G (Misc Micro-Optimizations) と整合する内容が多い:

- ループ内 `format!()` を `write!()` + 事前確保バッファに置換
- `Vec::contains()` を `HashSet` で置換（O(n) → O(1)）
- `std::HashMap` を `FxHashMap` に置換（SipHash → FxHasher）
- `to_string()` / `clone()` を `&str` / `Cow` 借用に置換
- 不要な `#[allow(dead_code)]` の除去
- 巨大 match 文を helper 関数に抽出

## 🔍 横断的「黄金パターン」

| # | パターン | 出現範囲 | 累積期待効果 |
|---|---------|----------|------------|
| G1 | `expr.as_json().clone()` / `serde_json::Value` | 8/8 ファイル | **5-20x** (Phase A) |
| G2 | hot path での `format!()` ループ + String 再割り当て | 8/8 | **10-30%** |
| G3 | AST ノード `.clone()` (OutputPart, JsExpr, Value) | 8/8 | **20-50%** (Rc 化) |
| G4 | `Vec::contains()` 線形検索 | 5/8 | HashSet で **5-15%** |
| G5 | `std::HashMap` (SipHash) hot path | 4/8 | FxHashMap で **3-8%** |
| G6 | テキストベース transform (script 操作) | 4/8 | AST 化で **30-50%** |
| G7 | silent fallback (`unwrap_or("")` 等) | 8/8 | 診断性 |
| G8 | 公式 `unshift` vs rsvelte `push` 順序逆転 | 1 | fixture 一致 |
| G9 | 巨大関数 (1000-2000+ 行) | 3/8 | 保守性 |

## 📋 推奨される作業計画

1. **本 PR**: Critical 4 件（適用済み）+ この tracking document
2. **個別 PR**: A5 unshift 順序修正（fixture 比較で影響を計測）
3. **長期計画**:
   - Phase A: serde_json::Value 排除（multi-month）
   - Phase D: codegen 2 重レンダリング排除
   - Phase A3: visitor pattern 統合
4. **継続的改善**: Minor 指摘を perf 計測結果に基づき優先順位付けて取り込む

## ⚠️ 残存する test 失敗（次セッション後）

`pnpm run compatibility-report` 実行結果（2026-05-02 時点、本ファイル最終更新時）:

- **Overall: 3023/3165 (95.51%)**
- runtime-runes: 861/865 (**4 件失敗** — `svelte-component-switch-dev`, `hmr-removal`, `hmr-each-keyed-unshift`, `component-transition-hmr`、いずれも HMR / dev mode 関連)
- server-side-rendering: 81/82（**1 件失敗** — `spread-attributes-white-space`、OXC normalization の whitespace 系、pre-existing）
- parser-legacy: 82/83（1 件 skip — `javascript-comments`、OXC vs acorn の comment attachment 差）
- validator: 324/324（1 件 skip — `error-mode-warn`）
- snapshot: 20/20 ✅ (前セッションで 0/20 だったもの)
- css: 179/179 ✅ (前セッションで 163-170/179 だったもの)
- compiler-errors / hydration / parser-modern / runtime-browser / runtime-legacy: 100%

CLAUDE.md の記載 (3068/3068, 100%) との乖離: 137 件 skip (preprocess 19, migrate 76, print 40, sourcemaps 0, parser-legacy 1, validator 1) を分母から除外すれば実質 **3023/3028 (99.83%)**。残り 5 件は HMR + whitespace で、本セッションのスコープ外。
