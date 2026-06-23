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
| `compat/corpus/known-failures.json` | **37**（67→50→37、直近セッションで −13） | CSR/SSR コンパイル出力の非一致。下記クラスタ別 root-cause マップ参照。 |
| `compat/corpus/fmt-known-failures.json` | **0** ✅ | （PR #1111 で達成済み） |
| `compat/corpus/svelte2tsx-known-failures.json` | 0 | ✅ 既に 100% |

#### 直近セッションで直したクラスタ（50→37、各コミットでコーパス verify + gate 緑）
1. **server each-item が同名 component `$derived` を read-wrap で shadow**（`server/ast/visitors/each_block.rs`）— each-block の context 名を `slot_let_shadows` だけでなく `shadowed_names` にも push。`{#each tree.children as file}` 内の `file.path` が外側 `const file = $derived(...)` で `file().path` に誤 wrap される問題を修正。**component-code-viewer-code-title** −1。
2. **module path の `$state.snapshot` strip**（`server/transform_script.rs::strip_snapshot_declarator_init_module` + `server/mod.rs`）— `.svelte.ts` で `const NAME = $state.snapshot(x)` だけ bare `x` に（declarator-init 限定。plain assignment は `$.snapshot` 維持）。公式 `compileModule` 準拠。**Popover/Tooltip/selection-state** −3。
3. **server destructured-props lowering**（`server/ast/script.rs::extract_paths`）— ①ArrayPattern ごとに `$$array`/`$$array_1`/… を component-wide counter で採番（leaf access + nested to_array base も）。②AssignmentPattern default を `$.fallback(access, default)` で wrap（`build_fallback`）。③RestElement: array `[a, ...rest]`→`rest = $$array.slice(i)`（rest 有り時 length 引数省略）、object `{a, ...rest}`→`$.exclude_from_object`。nested rest も再帰。**destructured-props-1/2/4/5** −4。
4. **SSR component trailing `<!---->` anchor in preserve-whitespace**（`server/ast/mod.rs::is_standalone_fragment`）— preserve-ws（`<pre>`/`<textarea>`）下では whitespace-only text を real sibling として数え、component が standalone 扱いされて trailing `<!---->` が抜ける問題を修正。**theme-customizer-code** −1。
5. **client each-item assign/mutate → uses_index（per-block flag stack）**（`client/visitors/each_block.rs` + `expression_converter.rs` + `types.rs`）— each item の assign/mutate で OWNING block の uses_index を立てる name→flag スタック。nested-each で外側 item を mutate しても外側の `$$index` param が出る（EachBlock.js 準拠）。※AST path の正しさ改善。team-members は verbatim-fallback 経由なので corpus 減には未寄与。
6. **server constant-fold で `\u`/`\x` escape を decode**（`server/helpers.rs::extract_constant_vars` ← client `decode_unicode_escapes` を pub(crate) 化）— string-literal const を cooked value に。**bidirectional-control-characters** −1。
7. **static input child が parent traversal を強制しない**（`client/visitors/regular_element.rs::has_dynamic_children_for_merge`）— `!is_static_element(child)` だと static `<input checked>` が parent を dynamic 化し spurious `$.child(...) + $.remove_input_defaults(...)`。公式準拠で `has_dynamic_children`（attribute ベース）に置換。**framer-command** −1。
8. **rest_excludes を `$.with_script` テンプレより上に hoist**（`client/mod.rs::find_module_scope_injection_point`）— `= $.with_script(` を factory needle に追加。**DarkMode** −1。
9. **nested-arrow を含む prop default を non-simple 扱い（lazy thunk）**（`client/props_transforms.rs::is_simple_expression_str`）— `=>` がどこかにあれば call/member 判定を bail していた → `has_top_level_arrow`（depth 0 の `=>` のみ arrow）で gate。**callout** −1。

> **試したが REVERT したもの（次セッション注意）:** ①props-default を non_proxy_vars に追加（reassign は非 proxy だが `$.state(prop)` initializer は常に proxy ＝ non_proxy_vars 共有のため `$.state($.proxy(prop()))` を3件 REGRESS）。reassign 専用ルールが要る。②`infer_namespace` の deep `check_nodes_for_namespace`（Dropzone は直るが AccordionItem/Loading で svg↔html 双方向 REGRESS。deep-walk の shallow-loop との相互作用が微妙）。③component prop の object reactivity: `has_reactive_state_json` の Normal-binding path を `is_expression_known_json`（context-aware・recursive・template literal 対応）に全置換 → metaTitle/subtitle/dark 等で 3件 REGRESS（is_expression_known_json は一部で stricter）。EXPAND-only OR（template-literal だけ追加で known 扱い）は無回帰だが blocks/+page を直せず（`og={{ url: image }}` の `image`=template-of-known-const が依然 reactive 扱い；regular-attribute memoize path が別 check か has_call か未特定）。MetaTags クラスタ（blocks/+page, flowbite/+page, 他 +page 群）は regular-attribute memoize の reactivity 判定を要精査。

#### 旧セッションで直したクラスタ（67→58、各コミットでコーパス verify + gate 緑）
1. **私有 `$state` フィールド代入の scope-aware should_proxy**（`private_class_assign_ast.rs`）— ①複合代入
   (`this.#x += y`) は `is_non_coercive_operator` が false なので proxy しない。②識別子 RHS は binding の
   initializer を辿る（`const fps = 1000/delta; this.#fps = fps` → BinaryExpression initial → 非 proxy）。
   テキスト `expression_needs_proxy(rhs_text)` を AST ベース `should_proxy_with_bindings` に置換。**−3**
2. **コンストラクタ内ネスト関数の私有 `$state` read**（`private_v_suffix_ast.rs`）— 直body (depth 0) は `.v`、
   ネスト関数/arrow 内（construction 後に実行）は `$.get(...)`。`fn_depth` を追跡。**−2**
3. **boundary 直下の `{#snippet}` を inline 出力**（`server/ast/visitors/snippet_block.rs`）— analyze が
   `<svelte:boundary>` で depth を上げないため `can_hoist` が誤って true。汎用 SnippetBlock visitor の hoist 判定を
   `can_hoist && fragment_depth <= 1` に gate（boundary visitor の `failed` と同じ）。**−4**
4. **`Math.*`/`Number`/`String`/`BigInt` call を const binding の is_defined 扱い**（phase2
   `variable_declarator.rs::is_expression_defined`）— `const x = Math.round(...)` を公式 `scope.evaluate` は
   defined 扱い（template `{x}` に `?? ""` を付けない）だが、phase2 は CallExpression を一律 false にしていた。
   client `is_known_defined_global_call` と同じ keypath 集合で CallExpression branch を追加。**−2**
5. **css_props の SVG-namespace flag**（`server/ast/visitors/component.rs` + `process_children_inner`）—
   `$.css_props($$renderer, <is_html>, …)` の 2nd arg を `true` 決め打ちにしていた。公式は
   `namespace === 'svg' ? false : true`。`ServerTransformState::namespace` を新設し `process_children_inner`
   で渡された namespace を save/restore（`in_element_children` と同パターン）、component visitor が参照。**−1**
6. **spread 内の store read**（`client/store_transforms.rs`）— store-sub read-wrap scanner が `.` 前置を
   property-access (`obj.$store`) として一律 skip していたため、spread (`[...$store.items]` の `...$store`)
   の `$store` も skip されていた。前 3 文字が `...` なら spread と判定して wrap を許可（単独 `.` の property
   access は従来通り skip）。`$formData.items = [...$formData.items, id]` が `[...$formData().items, id]` に。**−1**

> **本セッションで判明した root-cause（要・追加作業 / 高リスクのため未着手）:**
> - **`pin-input.svelte.ts`**（精密診断済み・テキスト修正は REGRESS するので AST 必須）: コンストラクタ内の
>   member MUTATION `this.#x.prop = value`（`#x` は private `$state`）が `this.#x.v.prop = value` になる
>   （`class_transforms.rs::transform_constructor_assignment` 〜2180 の blanket `this.#name.`→`this.#name.v.` 置換）。
>   公式は **proxy 経由** `$.get(this.#x).prop = value`（mutation は proxy を変更）。READ は `.v` のまま。
>   テキストで「mutation(assignment-target) は `$.get`、read は `.v`」を判定する heuristic（leading-member +
>   top-level `=`）を試したが **runtime-runes 1件 + corpus 1件を REGRESS**（read/method-call/compound で
>   over-match）→ 即 revert。真の修正は AST `ClassBody`（§6）で assignment-target vs read を AST 判定すること。
> - **`flowbite products/+page`**: `{#each [literal] as title}{title}` の each-item テキストが公式は
>   `$.template_effect(() => $.set_text(text, title))`（reactive）だが我々は static `text.nodeValue = title`。
>   literal-array each-item の text-reactivity 判定が必要（全 each ブロックに影響＝広範・高リスク）。
>   ※ const-shadow fold バグは修正済み（commit「don't constant-fold an identifier shadowed by an {#each} item」）。
> - **`SpatialMenuNav`**: (a) component-level `$.set(highlighted, id, true)` の余分な proxy ＝ `const id = \`…\``
>   が **ネストスコープ**（`forEach` callback）で宣言されるため `non_proxy_vars`（top-level のみ収集）から漏れる。
>   公式は binding initial（TemplateLiteral）を辿って非 proxy 判定。`non_proxy_vars` の `is_top_level` gate を
>   緩めるか、private-field 同様の scope-aware should_proxy 化が要る（name ベースなので同名 binding 衝突リスク）。
>   (b) spread-object の `style` 値テンプレート `${cols}` に `?? ""` が付かない（spread 専用 builder が
>   `build_template_chunk` の `?? ""` ロジックを通っていない）。
> - **`pin-input.svelte.ts`**（CLIENT は修正済み・SERVER は dom-typeahead と同根）: nested-fn member mutation
>   `this.#x.prop=v` の CLIENT は `private_member_mutate_root_ast`（fn_depth>0 のとき `$.get`）で修正済み
>   （commit「nested-fn private $state member mutation reads through the proxy」）。残る SERVER 差分は
>   `this.#regexPattern` private `$derived` read が `this.#regexPattern()`（callable）にならない＝dom-typeahead と同根。
> - **dom-typeahead / pin-input SERVER の `$derived` read（bolt-on 不可・+55 REGRESS で確認）**:
>   bare `this.#d` → `this.#d()` を後付け AST パスで一括 wrap しようとすると **corpus +55 REGRESS**。理由: 既存
>   server module pipeline は **単純 `$derived` の read を既に `$.get(this.#d)`→`this.#d()` で wrap している**ので、
>   後付けパスが二重 `this.#d()()` 化する。本当に未対応なのは **`$derived.by` の callee read**（`this.#getCurrentItem()`
>   → `()()`）等、既存が漏らすケースのみ。テキスト/後付けでは「既存処理済み」と「未処理」が区別不能
>   （`$.get`変換後の `this.#d()` と source callee `this.#d()` が同形）。真の修正は **module read-wrap
>   （`transform_module_source_for_module`）を component path 同様 callee も含め全 derived read を一律 `$.get` wrap
>   するよう直す**こと（= §6 ClassBody rewrite の server 部分）。
> - **`dom-typeahead.svelte.ts`**（精密診断済み）: server module path で private `$derived.by` フィールドの
>   callee 位置 read `this.#x()` が公式 `this.#x()()` にならない。`collect_derived_private_fields` は
>   `getCurrentItem` を**正しく derived 集合に収集している**（debug 確認済み）。真因は手前: `.svelte.ts` は
>   esbuild で TS-strip 済み → `transform_module_source_for_module(src, analysis, false)` が **callee 位置の
>   private derived read を `$.get(this.#x)` でラップしない**（COMPONENT path はラップする；MODULE path の差）。
>   そのため `post_process_for_server` に `$.get(...)` マーカーが無く、bare `this.#x()`（source 由来）のまま残る。
>   `post_process` 側で bare `this.#<derived>` をテキスト走査して `()` 付与する案は**不可**: `$.get` 変換後の
>   `this.#x()` と source bare-callee `this.#x()` がテキスト上区別不能で二重 `()()` になる。真の修正は MODULE
>   read-wrap（§5.3 のテキスト機構）を component path 同様 callee もラップするよう直すこと。
>
> **本セッションで試したが未達（root-cause 判明・defer 理由）:** ①`declaration-tag-division`（typed `{@const
> typed: number = …}` が server で丸ごと drop。id span / declarator JSON 形状の深掘りが必要・print fixture）。
> ②`dom-typeahead.svelte.ts`（private `$derived.by` フィールドの **callee 位置**読み `this.#x()` を
> `this.#x()()` に＝derived getter call 追加が必要。`collect_derived_private_fields` は TS strip 後に走るので
> 型注釈名バグは無関係、read-transform が callee 位置を未対応）。③`selection-state`/`Popover` の server
> `$state.snapshot` strip は `compileModule` 内部ロジック依存。

#### 残り 37 の root-cause マップ（次セッションの burn-down 指針。各 verify は rebuild napi→`corpus:compile`(12s)→`corpus:verify`）
> **残り 37 のクラスタ別内訳（直近セッション時点）:** ①`.svelte.ts` クラス機構（~8: navigation-menu/pin-input/scroll-area/tooltip/use-floating-layer/dom-typeahead/Toaster）＝§6 ClassBody AST rewrite が本丸。②client `generate_expr`/Raw/verbatim-fallback（~10: team-members/preview/ClipboardManager/badge/spinner/callout/framer-command/mobile-nav/blocks/+page）＝§2 client AST 化が前提（bind get/set setter 内の each-item/@const read が `$.get` wrap されない、component prop arrow が text path 等）。③コメント保持（~6: scroll-area/Toaster/Video/sidebar-menu-skeleton/transition）＝§5.4。④namespace（Dropzone/analytics-card）＝deep `check_nodes_for_namespace`（上記 REVERT 理由参照、要慎重）。⑤niche svelte fixture（const-tag-snippet 重複 snippet 順序/migrate slot-usages/bidirectional unicode escape/store-rune-conflic `$state`=store vs rune 曖昧）。⑥literal-array each-item text reactivity（products/users `+page`＝広範・高リスク）、CompoAttributesViewer（statement-context での `return $$value` 抑制＝await-RHS destructure）。
> 検証ループ: `CARGO_TARGET_DIR=target-verify cargo build --release --features napi --lib && cp
> target-verify/release/librsvelte_core.dylib .corpus-cache/rsvelte.node && pnpm run corpus:compile &&
> pnpm run corpus:verify`。baseline 更新: `node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline`
> （macOS で CSR/SSR baseline 可）。gate: `RUST_MIN_STACK=33554432 CARGO_TARGET_DIR=target-ast cargo test
> -p rsvelte_core --test runtime --test ssr --test compiler_fixtures -- --test-threads=4`（debug は要 RUST_MIN_STACK）。

- **`.svelte.(ts|js)` クラス state machinery（最大群・~13ファイル）** — `class_transforms.rs` + 衛星
  `private_*_ast.rs` 群はテキスト/span 編集ベースの不完全な再実装。残バグ: ①member-mutation
  `this.#state.foo = x`（代入ターゲットの member chain）が `$.get(base)` でなく `.v` になる（pin-input。
  代入ターゲット member は `visit_static_member_expression` で skip されないため `.v` が付く）。②クラスフィールド
  **宣言順** の差異（grace-area: `#enabled;` の位置）。③クラスフィールド **コメント** 配置（tooltip `/** Props */`,
  transition `count` vs コメント）。**真の修正は AST `ClassBody` visitor 化**（公式 `ClassBody.js` 移植）。これが
  §5「テキスト除去」の class 部分の本丸でもある。
- **comment-fallback（~3+）** — to_oxc がコメント付き Raw で bail→codegen.rs verbatim（単引用 import 等で乖離）。
  公式は `/* @__PURE__ */`（tooltip.svelte.ts）等の機能コメントを **保持** するので §5.4 のコメント保持が必須。
  esrap は `print_with_comments`/`CommentHooks` あり。再構成 program の座標統一が課題。
- **template chunk `?? ""` の is_defined**（bar-chart-card, visitors, SpatialMenuNav）— `${desktopDelta}` で
  `desktopDelta = Math.round(...)` を公式は defined 扱い（`?? ""` なし）だが我々は付ける（逆に spread style の
  `${cols}` は付け損ねる）。`is_expression_defined` の identifier→const-initializer トレースが CallExpression
  (`Math.round`) を defined と判定できない（phase2 `initial_is_defined` が CallExpression に未対応）。公式
  `scope.evaluate().is_defined` 相当の拡張が要る。
- **コンポーネント level proxy `, true`**（`local_assign_ast.rs`/`state_assigns_combined_ast.rs`/
  `state_pipeline_ast.rs`）— 無条件に `, true` を付ける。should_proxy を #1 と同様 scope-aware 化すべき
  （ただし SpatialMenuNav 等は `?? ""` 等の別 diff も併発）。
- **server `$state.snapshot` strip（module path）**（Popover/selection-state `.svelte.ts`）— `compileModule`
  系で公式は `$state.snapshot(x)` → `x`（bare）になる場合がある。`.svelte.ts` module の server transform を要確認。
  併発して `/* State */` 等のコメント diff もあり。
- **destructured-props（legacy・4ファイル svelte 本体）** — ①ネスト array destructure の `$$array` カウンタが
  `$$array_1` にインクリメントされない。②destructure default (`g = default_g`) の `$.fallback(tmp.g, default_g)`
  ネスト fallback が欠落。server destructure lowering の精緻化。
- **svg/html namespace + whitespace collapse**（analytics-card, Dropzone, circular-gauge, Datepicker）—
  `from_svg`/`from_html` の判定と、要素間 whitespace 折り畳み（`<!> <!>` vs `<!><!>`）+ `$.sibling(n, 2)` offset。
  known-hard な whitespace 領域。
- **store auto-sub の取りこぼし**（checkbox-form-multiple: `$formData.items` が `$formData().items` であるべき）、
  **each index param 欠落**（team-members: `($$anchor, member, $$index_1)` の `$$index_1`）、
  **定数畳み込み過剰**（flowbite products/+page: reactive な `title` を literal に畳む）、
  **false-positive `store_invalid_scoped_subscription`**（date-picker-form: `const { form: formData } = form` の
  destructured top-level store を scoped 判定）— 各 1〜2 ファイルの個別バグ。
- **doc/error/print fixture**（compile-errors 5.svelte の nested-boundary 順序, declaration-tag-division print,
  bidirectional-control-characters unicode escape, module-script-reactive-declaration, migrate/slot-usages）—
  svelte 本体の特殊 fixture 群。一部は intentionally-weird。

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

---

## 6. AST `ClassBody` リライト計画（ユーザー選択・次セッションの主作業）

> **方針（2026-06-22 ユーザー合意）:** §5 のテキスト除去の本丸かつコーパス最大クラスタ（`.svelte.ts`
> クラス state 機構）を同時に解決するため、テキスト/span ベースのクラス機構を公式 `ClassBody.js` 準拠の
> **AST 変換に置換**する。**インクリメンタルに**進め、各ステップで gate（runtime/ssr/compiler_fixtures）+
> corpus を緑に保つ（1ステップ = 1テキストサブパスを byte 一致 AST 化）。

### 6-1. 置換対象のテキスト/span 機構（現状）
- **client**: `class_transforms.rs`（巨大）＋衛星 AST-walker-but-text-edit 群:
  `private_class_assign_ast.rs`（`this.#x = v` → `$.set`）, `private_field_assign_ast.rs`,
  `private_v_suffix_ast.rs`（コンストラクタ read → `.v`）, `private_read_wrap_ast.rs`（standalone read → `$.get`）,
  `private_member_read_wrap_ast.rs`（`q.foo` → `$.get(q).foo`）, `state_*_ast.rs`, `local_assign_ast.rs`,
  `store_*_ast.rs`, `legacy_state_member_mutate_ast.rs`。これらは oxc を parse→walk→**テキスト Edit (start,end,String)**
  を splice する方式（真の AST 出力ではない）。
- **server (component)**: `server/transform_script.rs::transform_class_fields_server`,
  `server/mod.rs::{collect_derived_private_fields, post_process_for_server}`（`$.get(this.#x)`→`this.#x()`/`this.#x`,
  `$.set(...)`→`this.#x(v)`/`this.#x=v`）。
- **server (module `.svelte.js/.ts`)**: `transform_server_module` →
  `client::transform_module_source_for_module`（callee 位置の private derived read を `$.get` でラップしない＝
  dom-typeahead バグの真因）→ `post_process_for_server`。

### 6-2. 公式アルゴリズム（写経対象）
- **client `ClassBody.js`（111行・已読）**: `analysis.classes.get(node)` の `state_fields` を使い、
  各 field を ①PUBLIC `x = $state(v)` → backing `#x = $.state(v)` ＋ `get x(){ return $.get(this.#x); }` ＋
  `set x(v){ $.set(this.#x, v, should_proxy && true); }`（read/write はアクセサ経由なので `this.x` は無改変）。
  ②PRIVATE `#x = $state(v)` → backing のみ（`#x = $.state(v)`）。`this.#x` の read/write は **別 visitor** が改変:
  `AssignmentExpression.js`（`this.#x = v` → `$.set(this.#x, v, proxy)`, 複合は coercive 判定）＋ member/identifier
  visitor（`this.#x` read → `$.get(this.#x)`）。constructor 直 body の `$state` read は `.v`（synchronous）、
  ネスト関数内は `$.get`（`state.in_constructor`）。should_proxy は scope-aware（binding.initial を辿る）。
- **server**: ClassBody.js は無く、`$state(v)`→`v`（plain）, `$derived(fn)`→`$.derived(fn)`（callable, read=`this.#x()`）。
  public `$state` は plain public value。

### 6-3. インクリメンタル順序（各ステップ commit + gate + corpus）
1. **基盤**: `client/class_body_ast.rs` を新設。oxc で script を parse → ClassBody を walk → 公式準拠の
   新 ClassBody を **rebuild**（b::* builders）→ esrap で印字 → 元クラス span を置換（境界はまだ text edit だが
   内部は純 AST）。まず PUBLIC `$state` field の backing+accessor 生成を実装、`transform_class_fields_client`/
   `class_transforms` の該当部を **これに委譲**。byte 一致を gate+corpus で確認。
2. **private read/write**: `this.#x` read → `$.get`, write → `$.set`（scope-aware proxy）, constructor `.v` /
   nested `$.get` を ClassBody 配下の member/assignment 改変として AST 化。`private_*_ast.rs` 群を順次廃止。
   → pin-input（member-mutation `.v`）, grace-area（field 順序）等が直る見込み。
3. **server (component)**: ②の AST 結果を server 用に lower（`$state`→plain, `$derived`→callable read `this.#x()`）。
   `transform_class_fields_server`/`collect_derived_private_fields`/`post_process_for_server` の class 部分を置換。
4. **server (module)**: `transform_module_source_for_module` の class read-wrap を component path と同等（callee も
   `$.get` ラップ）に。→ dom-typeahead（`this.#x()()`）が直る。
5. **掃除**: 置換済みの `private_*_ast.rs` / `class_transforms.rs` の class 部分を削除。net テキスト削減を記録。

### 6-4. 検証ループ（各ステップ必須）
- `CARGO_TARGET_DIR=target-verify cargo build --release --features napi --lib && cp
  target-verify/release/librsvelte_core.dylib .corpus-cache/rsvelte.node && pnpm run corpus:compile &&
  pnpm run corpus:verify`（regression 0 必須）。
- `RUST_MIN_STACK=33554432 CARGO_TARGET_DIR=target-ast cargo test -p rsvelte_core --test runtime --test ssr
  --test compiler_fixtures -- --test-threads=4`（19/16/17 維持）。
- 高速単体反復: node で `rs.compile(src,{generate})` / `rs.compileModule(src,{generate})`（`.corpus-cache/rsvelte.node`）。
  `.svelte.ts` は esbuild TS-strip 済み前提なので **手で型注釈を外した** ソースを渡す。

### 6-5. このリライトで直る既知コーパス失敗
dom-typeahead, pin-input, collapsible 系の `.svelte.ts` クラス read/write, grace-area（field 順序）,
tooltip/transition（field コメント配置）, 他 `.svelte.ts` クラス群（最大クラスタ ~13 ファイル）。
