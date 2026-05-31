# タスク: rsvelte SSR をテキストベースからAST-basedコード生成にリファクタリング

## 背景

rsvelte の SSR コード生成は現在**テキストベース**で実装されており、ソースコードのテキストを直接切り貼りして出力を構築しています。一方、公式 Svelte コンパイラは**AST-based**で、ESTree AST を構築し、esrap でコード出力します。

この違いが以下の問題を引き起こしています:
- `$derived()` 除去後の改行残存（`const x =\n  expr`）
- ソースのインデント保持（スペース vs タブ変換の不完全）
- trailing comma の保持（OXC codegen がそのまま出力）
- メソッドチェインの行分断
- 関数引数の空白差異（`fn( x)` vs `fn(x)`）
- `$:` reactive declaration の変数宣言順序

現在の SSR 互換性: **880/910 (96.7%)**。残り30件はすべてこの根本的な制約に起因。

## 現状のアーキテクチャ

### テキストベース SSR（現在）
```
Source → Parser → AST → Analysis → ServerCodeGenerator(テキスト切り貼り) → String出力
                                    ↑
                                    ソーステキストを直接参照して切り出し
```

主要ファイル:
- `src/compiler/phases/3_transform/server/mod.rs` (2,178行) — エントリポイント、`ServerCodeGenerator` 構造体
- `src/compiler/phases/3_transform/server/build.rs` (6,087行) — `OutputPart` → 文字列結合
- `src/compiler/phases/3_transform/server/helpers.rs` (2,801行) — テキスト変換ヘルパー
- `src/compiler/phases/3_transform/server/transform_script.rs` (3,842行) — スクリプト本体のテキスト変換
- `src/compiler/phases/3_transform/server/transform_store.rs` (1,710行) — ストア変換（テキスト置換）
- `src/compiler/phases/3_transform/server/transform_legacy.rs` (2,259行) — legacy `$:` 変換
- `src/compiler/phases/3_transform/server/visitors/*.rs` — テンプレートノードの `OutputPart` 生成

テキストベースの処理フロー:
1. `instance_script` のソーステキストを取得
2. `strip_typescript()` でTS構文を除去（テキストベース）
3. `extract_imports()` でimport文を抽出（行単位テキスト処理）
4. `transform_script_content_with_imports()` でルーン変換（テキスト置換: `$state(x)` → `x`）
5. `transform_store_refs_in_script()` でストア変換（テキスト置換: `$store` → `$.store_get()`）
6. テンプレートノードを visit して `OutputPart` 列（Html/Expression/Component 等）を生成
7. `build()` で全 `OutputPart` を文字列に結合

### AST-based Client（参考実装）
```
Source → Parser → AST → Analysis → JsProgram(AST構築) → OXC codegen → String出力
                                    ↑
                                    AST ノードを構築・変換
```

主要ファイル:
- `src/compiler/phases/3_transform/client/transform_client.rs` — `client_component()` エントリポイント
- `src/compiler/phases/3_transform/js_ast/nodes.rs` — `JsProgram`, `JsStatement`, `JsExpr` AST 型
- `src/compiler/phases/3_transform/js_ast/codegen.rs` — AST → JavaScript 文字列出力
- `src/compiler/phases/3_transform/client/formatting.rs` — `normalize_js_with_oxc()` OXC 正規化

## 公式 Svelte コンパイラの SSR アーキテクチャ

ファイル: `svelte/packages/svelte/src/compiler/phases/3-transform/server/transform-server.js`

公式の処理フロー:
1. `walk()` で module AST を変換（`VariableDeclaration`, `Identifier`, `AssignmentExpression` 等のビジター）
2. `walk()` で instance AST を変換（同上）
3. `walk()` で template AST を変換（`Fragment`, `RegularElement`, `Component` 等のビジター）
4. template 出力は `b.call('$$renderer.push', b.template_literal(...))` のような ESTree ノードで構築
5. 最終的に `{ type: 'Program', body: [...hoisted, ...module.body, component_function] }` の ESTree を返す
6. 呼び出し元が `print()` (esrap) でコード出力

キーポイント:
- **instance script は AST レベルで変換** — `$state(x)` → AST の `init` を `x` に置換
- **ストア参照は Identifier ビジターで変換** — `$store` → `$.store_get($$store_subs ??= {}, '$store', store)` の AST ノード
- **テンプレート出力は AST ノードで構築** — `$$renderer.push()` 呼び出しの ESTree ノード
- **esrap がフォーマット** — インデント、行折り返し、trailing comma 除去をすべて esrap が処理

## リファクタリング方針

### フェーズ 1: instance/module スクリプトの AST-based 変換

**目標**: スクリプト本体のテキスト変換を AST ベースに置き換える

**現在のテキスト処理** (`transform_script.rs`, `transform_store.rs`, `transform_legacy.rs`):
```rust
// テキスト置換: "$state(x)" → "x"
let script = script.replace("$state(", ...);
// テキスト置換: "$store" → "$.store_get(...)"
result = replace_store_identifier_in_script(&result, name, store_name);
```

**目標のAST処理**:
```rust
// OXC で instance script をパース
let parsed = Parser::new(&allocator, script_source, source_type).parse();
// AST を走査して変換
// $state(x) → x （CallExpression の init を展開）
// $store → $.store_get() （Identifier を CallExpression に置換）
// trailing comma → 自動除去（OXC codegen が処理）
let output = Codegen::new().with_options(options).build(&transformed_program);
```

**影響ファイル**:
- `transform_script.rs` — `transform_rune_call_multiline()` 等を OXC AST 変換に置き換え
- `transform_store.rs` — `replace_store_identifier_in_script()` を OXC AST walk に置き換え
- `transform_legacy.rs` — `$:` 処理を OXC AST walk に置き換え
- `build.rs` — `script_code` の生成パスを変更

**期待効果**: 残り30件のうち ~15件（trailing comma、行分断、インデント）が解消

### フェーズ 2: テンプレート出力の AST-based 構築

**目標**: `OutputPart` → 文字列結合を `JsStatement` → codegen に置き換え

**現在の構造**:
```rust
enum OutputPart {
    Html(String),           // 静的HTML文字列
    Expression(String),     // ${$.escape(expr)} 式
    Component { ... },      // コンポーネント呼び出し
    IfBlock { ... },        // if ブロック
    // ...
}
// build() で文字列結合:
body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, html));
```

**目標の構造**:
```rust
// OutputPart の代わりに JsStatement を構築
let push_call = JsStatement::Expression(JsExpressionStatement {
    expression: JsExpr::Call(JsCallExpression {
        callee: "$$renderer.push".into(),
        arguments: vec![JsExpr::TemplateLiteral(...)],
    }),
});
template_body.push(push_call);
```

**影響ファイル**:
- `build.rs` — `build_parts_with_store_subs()` を `JsStatement` 構築に変更
- `visitors/*.rs` — `OutputPart` 生成を `JsStatement` 生成に変更
- `types.rs` — `OutputPart` enum を段階的に廃止

**期待効果**: 残り30件のうち ~10件（テンプレート内の空白差異、ハイドレーションマーカー）が解消

### フェーズ 3: 最終出力の OXC codegen 統合

**目標**: `JsProgram` → OXC codegen → esrap 互換出力

Client 側の実装を参考に:
```rust
// client/mod.rs の実装パターン
let program = JsProgram { body };
let mut codegen = JsCodegen::new(&analysis.source);
codegen.emit_program(&program);
let output = codegen.output();
// OXC で正規化
let normalized = normalize_js_with_oxc(&output, 0);
```

SSR でも同様に:
```rust
pub fn transform_server(analysis, ast, source, options) -> Result<String, TransformError> {
    // 1. instance/module を AST 変換
    // 2. テンプレートを JsStatement 列に変換
    // 3. JsProgram を構築
    // 4. codegen + OXC 正規化で出力
}
```

## 削除対象のテキスト処理コード

リファクタリング完了後に削除可能:
- `transform_script.rs` の大部分（`transform_rune_call_multiline`, `add_statement_semicolon` 等）
- `transform_store.rs` の `replace_store_identifier_in_script`
- `transform_legacy.rs` の大部分
- `helpers.rs` の `extract_imports`, `normalize_import`, `transform_props_spread_ex` 等
- `build.rs` の `build_parts_with_store_subs`, 文字列テンプレート組み立て
- `mod.rs` の `strip_empty_statements`, `add_esrap_blank_lines`, `split_concatenated_braces` 等

## 制約と注意事項

1. **段階的リファクタリング**: 一度にすべてを変更するのではなく、フェーズ1→2→3の順で進める
2. **テスト駆動**: 各フェーズ後に `cargo test --release --test runtime` と `measure-ssr.mjs` で確認
3. **Client との互換**: `910/910` を維持すること
4. **既存の `JsProgram` / `JsStatement` / `JsExpr` を活用**: `src/compiler/phases/3_transform/js_ast/` にある型をそのまま使う
5. **OXC の活用**: スクリプト変換では OXC parse → AST walk → OXC codegen のパターンを使う
6. **`normalize_js_with_oxc` の活用**: Client 側の `formatting.rs` にある関数を SSR でも使う
7. **`JsStatement::Raw` の活用**: 移行期間中はテキストベースの出力を `Raw` ノードでラップしてAST に統合可能

## 環境

- Docker コンテナ: `rsvelte_core-dev`
- ビルド: `docker exec rsvelte_core-dev bash -c 'cd /workspace && cargo build --release --features napi --lib && cp target/release/librsvelte_core.so svelte/rsvelte.linux-arm64-gnu.node'`
- テスト: `docker exec rsvelte_core-dev bash -c 'cd /workspace && cargo test --release --test runtime test_runtime_runes -- --nocapture'`
- SSR 測定: `docker exec rsvelte_core-dev bash -c 'cd /workspace && LD_PRELOAD=/workspace/svelte/rsvelte.linux-arm64-gnu.node node scripts/bench/measure-ssr.mjs'`
- Client 測定: `docker exec rsvelte_core-dev bash -c 'cd /workspace && LD_PRELOAD=/workspace/svelte/rsvelte.linux-arm64-gnu.node node scripts/diff/precise-semantic-diff.mjs'`
- 1ファイル SSR 差分: `docker exec rsvelte_core-dev bash -c 'cd /workspace && LD_PRELOAD=/workspace/svelte/rsvelte.linux-arm64-gnu.node node scripts/diff/ssr-diff-one.mjs ".real-world-tests/<PATH>"'`

## 現在の SSR 差分一覧 (30件)

| ファイル | 差分パターン |
|---------|------------|
| asset-viewer.svelte | trailing comma `onRandom, }` |
| memory-viewer.svelte | trailing comma `undefined, )()` |
| gallery-viewer.svelte | スクリプト/テンプレート出力順序 |
| map.svelte | 関数本体のインデント |
| folders/+page.svelte | オブジェクトリテラル形式 |
| workflows/+page.svelte | children callback 差異 |
| CopyMarkdown.svelte | テンプレート定数畳み込み |
| FunctionDoc.svelte | テンプレート空白 |
| VersionDropdown.svelte | `$:` 変数宣言順序 |
| +page.svelte (gradio) | スクリプト構造 |
| themes/gallery/+page.svelte | スクリプト構造 |
| ThemeDetailModal.svelte | テンプレートリテラル |
| catchall/+page.svelte | 関数引数の空白 |
| WaveformControls.svelte | テンプレートリテラル行分断 |
| Component.svelte | コンポーネント props 形式 |
| component-test/+page.svelte | スクリプト構造 |
| Blocks.svelte | コンポーネント props |
| api_docs/CopyMarkdown.svelte | スクリプト構造 |
| ParametersSnippet.svelte | UTF-8 + テンプレート |
| HTML.stories.svelte | テンプレートリテラル |
| html/Index.svelte | children 空白 |
| Webcam.svelte | select/option 処理 |
| Toolbar.svelte | 関数引数の空白 |
| Navbar.stories.svelte | テンプレート構造 |
| ParamViewer.svelte | 関数引数の空白 |
| Plot.svelte | スクリプト構造 |
| simpledropdown/Index.svelte | コンポーネント props |
| spa/Index.svelte | 関数引数の空白 |
| statustracker/index.svelte | UTF-8 エンコーディング |
| VideoControls.svelte | コンポーネント props 順序 |
