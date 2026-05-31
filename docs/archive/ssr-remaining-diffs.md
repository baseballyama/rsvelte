# SSR 残り差分の解消ガイド

## 現状

**Canon match: 870/897 (97.0%)** — 27件の semantic diff が残存。

全テスト通過: SSR 81/82, Runtime 861/861, Snapshot 20/20

## ���了済みアーキテクチャ

```
Visitors → OutputPart → bridge.rs (per-part conversion)
                             ↓
                        TemplateItem (Expression/Statement)
                             ↓
                        build_template() (coalesces into template literals)
                             ↓
                        Vec<JsStatement>
                             ↓
JsProgram { Import, FunctionDecl { Raw(script), [JsStatements] }, ExportDefault }
                             ↓
                        generate() → JavaScript output
```

スクリプト部分は `normalize_script_with_oxc()` で OXC 正規化済み（trailing comma, 空白, インデント修正）。

## 残り27件の差分カテゴリ

### カテゴリ 1: $props destructure が1行にまとまる（~8件）

**症状**:

```
// 期待 (公式 Svelte/esrap)
let {
    cursor,
    showNavigation = true,
    withStacked = false
} = $$props;

// 現在の rsvelte
let { cursor, showNavigation = true, withStacked = false } = $$props;
```

**原因**: `normalize_script_with_oxc()` の `split_long_destructures()` が `$props()` → `$$props` に変換された後の destructure に対して動作しているが、component wrapper (`$$renderer.component(($$renderer) => { ... })`) の中にある場合、OXC に渡される前に `transform_props_spread_ex()` で追加のインデント変換が行われ、元のフォーマット情報が失われる。

**修正方針**: `split_long_destructures()` を `transform_props_spread_ex()` の後にも適用するか、`build_program()` 内の component wrapper 組み立て後に適用。

**該当ファイル**: asset-viewer.svelte, Blocks.svelte, Plot.svelte, VersionDropdown.svelte 等

### カテゴリ 2: Component 呼び出しのインデントずれ（~5件）

**症状**:

```
// 期待
        Block($$renderer, {
            visible: gradio.shared.visible,
            elem_id: gradio.shared.elem_id,

// 現在の rsvelte
        Block($$renderer, {
    visible: gradio.shared.visible,
    elem_id: gradio.shared.elem_id,
```

**原因**: `generate_component_call_code()` (build.rs) がインデントレベル0でコードを生成し、bridge.rs が `JsStatement::Raw` でラップ。codegen は Raw の最初の行のみにインデントを追加し、後続行はインデントなし。Component の props が複数行にまたがる場合、2行目以降のインデントが足りない。

**修正方針**: `generate_component_call_code()` を修正して、出力するコードが正しい相対インデントを含むようにする。または bridge.rs の `convert_component_result()` で出力行にインデントを追加する後処理。

**該当ファイル**: simpledropdown/Index.svelte, Component.svelte, Blocks.svelte 等

### カテゴリ 3: Blank line 不足（~10件）

**症状**:

```
// 期待 — 異なる文タイプの間に blank line
let x = 0;

function foo() { ... }

// 現在の rsvelte — blank line がない
let x = 0;
function foo() { ... }
```

**原因**: OXC codegen は blank line を挿入しない。旧 `add_esrap_blank_lines()` (mod.rs から削除済み) はサーバー固有のロジックで raw 出力に blank line を挿入していた。client の `add_esrap_blank_lines()` は OXC 出力に対して設計されており、SSR のスクリプトコンテキスト（component wrapper 内の indented コード）にそのまま適用すると一部のケースで余計な blank line を挿入する。

**修正方針**:

1. client の `add_esrap_blank_lines()` を `normalize_script_with_oxc()` 内の OXC slow path で適用（OXC 出力は unindented なので正しく動作するはず）
2. ただし `} = $$props;` のような行が `}` で始まるため、前の行との間に不要な blank line が挿入される可能性。`split_long_destructures` で分割された行の `}` は特別扱いが必要。

**該当ファイル**: Component.svelte, map.svelte, spa/Index.svelte, ParametersSnippet.svelte 等

### カテゴリ 4: OXC のコード変換差異（~3件）

**症状**:

- `1000` → `1e3` (OXC が数値リテラルを変��)
- `if (x) y; else z;` → `if (x) y;\nelse z;` (OXC が改行を挿入)
- Object shorthand の展開/折り畳みが esrap と異なる
- コメント (`// comment`) の後の行の処理差

**原因**: OXC codegen と esrap のフォーマットルールの微妙な違い。

**修正方針**: `normalize_script_with_oxc()` の後処理で個別に対応。例: `1e3` → `1000` への逆変換（既に client 側に実装あ���）。

**該当ファイル**: Webcam.svelte, statustracker/index.svelte, nativeplot/Index.svelte

### カテゴリ 5: テンプレートリテラル内容差異（~2件）

**症状**: テンプレートリテラル (`\`...\``) の中の改行位置やインデントが異なる。

**原因**: テンプレートリテラルの静的コンテンツは visitor が生成する `OutputPart::Html` から来る。visitor のコンテンツ生成ロジック自体が公式と異なる。

**修正方針**: 該当 visitor のコード生成を公式実装と比較して修正。

**該当ファイル**: CopyMarkdown.svelte, HTML.stories.svelte

## 推奨アプローチ

### 短期（効果大、リスク低）

1. **blank line 復元**: `normalize_script_with_oxc()` の OXC パス内で `add_esrap_blank_lines()` を適用。ただし `split_long_destructures` の `} = expr` 行を例外処理。

2. **Component インデント修正**: `generate_component_call_code()` の出力に正しい相対インデントを付与。

3. **数値リテラル**: `1e3` → `1000` 等の逆変換。

### 中期（根本解決）

4. **visitor の TemplateItem 直接生成**: visitors を `OutputPart` ではなく `TemplateItem` を直接生成するように書き換え。これにより bridge.rs が不要になり、`build_parts_with_store_subs` を完全削除できる。
   - `visitors/shared/utils.rs` の `process_children()`, `build_template()`, `build_attribute_value()` が既に存在
   - `visitors/shared/component.rs` の `build_inline_component()` が既に存在
   - `visitors/shared/element.rs` の `build_element_attributes()` が既に存在
   - これらは `ComponentServerTransformState` を使用しており、visitor が直接使えるようにフレームワーク変更が必要

## 環境

- NAPI ビルド: `cargo build --release --features napi --lib && cp target/release/librsvelte_core.dylib svelte/rsvelte.darwin-arm64.node`
- SSR 測定: `node scripts/measure-ssr-batch.mjs` (結果は `/tmp/ssr_batch_result.txt`)
- 個別差分: `node scripts/show-ssr-diff.mjs ".real-world-tests/<PATH>"`
- テスト: `cargo test --release --test ssr test_ssr`
- 注意: NAPI ビルド後のテストはキャッシュ衝突する。`find target/release -name "librsvelte_core*" -delete && find target/release/.fingerprint -name "rsvelte_core-*" -exec rm -rf {} +` でクリーン。

## 差分ファイル一覧 (27件)

```
immich/web/src/lib/components/asset-viewer/asset-viewer.svelte
immich/web/src/lib/components/memory-page/memory-viewer.svelte
immich/web/src/lib/components/shared-components/gallery-viewer/gallery-viewer.svelte
immich/web/src/lib/components/shared-components/map/map.svelte
immich/web/src/routes/(user)/folders/[[photos=photos]]/[[assetId=id]]/+page.svelte
gradio/js/_website/src/lib/components/CopyMarkdown.svelte
gradio/js/_website/src/lib/components/FunctionDoc.svelte
gradio/js/_website/src/lib/components/VersionDropdown.svelte
gradio/js/_website/src/routes/+page.svelte
gradio/js/_website/src/routes/themes/gallery/+page.svelte
gradio/js/_website/src/routes/themes/gallery/ThemeDetailModal.svelte
gradio/js/app/src/routes/[...catchall]/+page.svelte
gradio/js/chatbot/shared/Component.svelte
gradio/js/component-test/src/routes/[...all]/+page.svelte
gradio/js/core/src/Blocks.svelte
gradio/js/core/src/api_docs/CopyMarkdown.svelte
gradio/js/core/src/api_docs/ParametersSnippet.svelte
gradio/js/html/HTML.stories.svelte
gradio/js/html/Index.svelte
gradio/js/image/shared/Webcam.svelte
gradio/js/imageeditor/shared/Toolbar.svelte
gradio/js/navbar/Navbar.stories.svelte
gradio/js/paramviewer/ParamViewer.svelte
gradio/js/plot/shared/Plot.svelte
gradio/js/simpledropdown/Index.svelte
gradio/js/spa/src/Index.svelte
gradio/js/statustracker/static/index.svelte
```
