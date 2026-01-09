# Phase 3 Client Visitor 実装ガイド

## 🎯 現状と目標

### 現在の状況

**runtime-runes テスト**: 10/724 テストがパス（1.4%）

**問題**: Phase 3 の client-side コード生成がほぼ未実装。以下のような基本的な機能が欠けている：
- 通常の HTML 要素の生成（`<button>`、`<div>` など）
- 制御フローブロック（`{#if}`、`{#each}` など）
- コンポーネント呼び出し
- イベントハンドラ
- ディレクティブ（`use:`、`bind:` など）

### 目標

Phase 3 の client visitor を実装して、runtime-runes テストの合格率を **1.4% → 50%+** に向上させる。

## 📋 実装すべき Visitor（優先順位順）

### 🔴 最優先（基礎機能）

1. **`regular_element.rs`** - 通常の HTML 要素
   - 優先度: ★★★★★
   - 影響: 90% 以上のテストに必要
   - 推定作業時間: 4-6 時間

2. **`fragment.rs`** - Fragment（子ノードのコンテナ）
   - 優先度: ★★★★★
   - 影響: すべてのテンプレートに必要
   - 推定作業時間: 2-3 時間

3. **`text.rs`** - テキストノード
   - 優先度: ★★★★☆
   - 影響: テキストを含むすべてのテンプレート
   - 推定作業時間: 1-2 時間

### 🟡 高優先度（制御フロー）

4. **`if_block.rs`** - {#if} ブロック
   - 優先度: ★★★★☆
   - 影響: 条件分岐を使う大量のテスト
   - 推定作業時間: 3-4 時間

5. **`each_block.rs`** - {#each} ブロック
   - 優先度: ★★★★☆
   - 影響: リスト表示を使う大量のテスト
   - 推定作業時間: 4-5 時間

6. **`component.rs`** - コンポーネント呼び出し
   - 優先度: ★★★☆☆
   - 影響: コンポーネントを使うテスト
   - 推定作業時間: 3-4 時間

### 🟢 中優先度（表現）

7. **`expression_tag.rs`** - {expressions}
   - 優先度: ★★★☆☆
   - 影響: 動的テキスト表示
   - 推定作業時間: 2-3 時間

8. **`attribute.rs`** - 属性の生成
   - 優先度: ★★★☆☆
   - 影響: 動的属性を持つ要素
   - 推定作業時間: 3-4 時間

### 🔵 低優先度（高度な機能）

9. **`await_block.rs`** - {#await} ブロック
10. **`key_block.rs`** - {#key} ブロック
11. **`snippet_block.rs`** - {#snippet} ブロック
12. **`html_tag.rs`** - {@html}
13. **`render_tag.rs`** - {@render}
14. **`svelte_element.rs`** - 動的要素

## 🚀 実装の始め方

### Step 1: 環境の確認

```bash
# コンパイルが通ることを確認
cargo build --lib

# 現在の状況を確認
cargo test --test runtime test_runtime_runes 2>&1 | grep "=== runtime-runes"
```

### Step 2: 参照コードの確認

各 visitor を実装する前に、以下を確認：

1. **公式 Svelte の実装**（JavaScript）
   ```
   svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/[visitor_name].js
   ```

2. **既存の visitor 実装**（参考パターン）
   ```
   src/compiler/phases/3_transform/client/visitors/animate_directive.rs
   ```

3. **Server visitor の実装**（同じノードの server 版）
   ```
   src/compiler/phases/3_transform/server/visitors/
   ```

### Step 3: 最初の Visitor を実装する

**推奨順序**: `fragment.rs` → `text.rs` → `regular_element.rs`

## 📝 実装パターン

### Visitor ファイルの基本構造

```rust
//! [VisitorName] visitor for client-side code generation.
//!
//! Corresponds to Svelte's `3-transform/client/visitors/[VisitorName].js`.

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase3_transform::client::types::ClientTransformContext;
use crate::compiler::phases::phase3_transform::js_ast::builders::*;

/// Visit a [NodeType] and generate client-side code.
///
/// # Arguments
///
/// * `node` - The [NodeType] to transform
/// * `context` - The transformation context
///
/// # Returns
///
/// Result indicating success or transformation error
pub fn visit(
    node: &[NodeType],
    context: &mut ClientTransformContext,
) -> Result<(), TransformError> {
    // 1. Extract node information
    // 2. Generate JavaScript AST nodes
    // 3. Add to context.body or appropriate location
    // 4. Process children recursively

    Ok(())
}
```

### 典型的な実装フロー

#### 1. Fragment Visitor の例

```rust
// fragment.rs
pub fn visit(
    fragment: &Fragment,
    context: &mut ClientTransformContext,
) -> Result<(), TransformError> {
    // 各子ノードを順番に処理
    for node in &fragment.nodes {
        visit_template_node(node, context)?;
    }
    Ok(())
}
```

#### 2. Text Visitor の例

```rust
// text.rs
pub fn visit(
    text_node: &Text,
    context: &mut ClientTransformContext,
) -> Result<(), TransformError> {
    // 静的テキストの場合
    if !text_node.data.contains('{') {
        // $.text() を生成
        let text_call = call_expression(
            member_expression("$", "text"),
            vec![],
        );
        context.body.push(text_call);
    } else {
        // 動的テキストの処理
        // TODO: 式の抽出と $.set_text() の生成
    }
    Ok(())
}
```

#### 3. Regular Element Visitor の例

```rust
// regular_element.rs
pub fn visit(
    element: &RegularElement,
    context: &mut ClientTransformContext,
) -> Result<(), TransformError> {
    // 1. 要素の作成
    // var button = $.element("button");

    // 2. 属性の設定
    for attr in &element.attributes {
        visit_attribute(attr, context)?;
    }

    // 3. イベントハンドラの設定
    for attr in &element.attributes {
        if let Attribute::EventHandler(handler) = attr {
            visit_event_handler(handler, context)?;
        }
    }

    // 4. 子要素の処理
    if let Some(ref fragment) = element.fragment {
        visit_fragment(fragment, context)?;
    }

    // 5. 親への追加
    // $.append($$anchor, button);

    Ok(())
}
```

## 🧪 テスト方法

### 個別テストの実行

```bash
# 特定のサンプルのコンパイルテスト
cargo build && cargo run -- compile \
  svelte/packages/svelte/tests/runtime-runes/samples/[sample_name]/main.svelte

# 生成されたコードの確認
cat fixtures/*/runtime-runes/[sample_name]/_actual/client.js

# 期待される出力との比較
diff \
  fixtures/*/runtime-runes/[sample_name]/client.js \
  fixtures/*/runtime-runes/[sample_name]/_actual/client.js
```

### 簡単なサンプルから始める

**推奨テストサンプル（難易度順）**:

1. `pre-no-content` - 空の要素（既にパス）
2. `comment-separated-text` - 静的テキスト（既にパス）
3. **`static-element`** - 静的な単純要素（最初の目標）
4. **`dynamic-text`** - 動的テキスト
5. **`if-simple`** - シンプルな {#if}
6. **`each-simple`** - シンプルな {#each}

### テストケースの追加

新しい visitor を実装したら、以下でテスト：

```bash
# runtime-runes テスト全体を実行（時間がかかる）
cargo test --test runtime test_runtime_runes

# 進捗レポートの生成
npm run compatibility-report
cat fixtures/*/compatibility-report.json | grep -A10 '"runtime-runes"'
```

## 📚 参考資料

### 公式 Svelte のコード

```
svelte/packages/svelte/src/compiler/phases/3-transform/client/
├── visitors/
│   ├── RegularElement.js       ← regular_element.rs の参考
│   ├── IfBlock.js              ← if_block.rs の参考
│   ├── EachBlock.js            ← each_block.rs の参考
│   ├── Component.js            ← component.rs の参考
│   └── ...
├── types.d.ts                  ← 型定義
└── utils.js                    ← ユーティリティ関数
```

### 既存のコード

- **AST 定義**: `src/ast/template.rs`
- **Transform types**: `src/compiler/phases/3_transform/client/types.rs`
- **JS AST builders**: `src/compiler/phases/3_transform/js_ast/builders.rs`
- **Server visitors**: `src/compiler/phases/3_transform/server/visitors/`

### Svelte 5 のランタイム関数

生成するコードで使う主な関数：

```javascript
// 要素作成
$.element(tag_name)           // 要素を作成
$.text()                      // テキストノードを作成
$.comment()                   // コメントノード（placeholder）

// DOM 操作
$.append(parent, child)       // 子要素を追加
$.first_child(node)          // 最初の子要素を取得
$.next()                     // 次の兄弟要素

// 属性・プロパティ
$.attr(element, name, value) // 属性を設定
$.set_text(text_node, value) // テキストを設定

// イベント
button.__click = handler     // イベントハンドラ
$.delegate(['click'])        // イベント委譲

// リアクティビティ
$.state(initial)             // state rune
$.derived(fn)                // derived rune
$.effect(fn)                 // effect rune
$.get(signal)                // 値の取得
$.template_effect(fn)        // テンプレート用 effect

// 制御フロー
$.if(node, render_fn)        // {#if}
$.each(node, flags, items, key_fn, render_fn)  // {#each}

// その他
$.from_html(html)            // HTML からノードを作成
$.action(node, fn, arg)      // use: directive
```

## 🎯 実装のマイルストーン

### Milestone 1: 静的要素（目標: 20% テスト通過）
- [ ] `fragment.rs` 実装
- [ ] `text.rs` 実装（静的テキストのみ）
- [ ] `regular_element.rs` 実装（静的要素のみ）
- [ ] テスト: `static-element` 系のサンプル

### Milestone 2: 動的コンテンツ（目標: 35% テスト通過）
- [ ] `expression_tag.rs` 実装
- [ ] `text.rs` 拡張（動的テキスト）
- [ ] `attribute.rs` 実装（動的属性）
- [ ] テスト: `dynamic-text`、`dynamic-attribute` 系

### Milestone 3: 制御フロー（目標: 50% テスト通過）
- [ ] `if_block.rs` 実装
- [ ] `each_block.rs` 実装（基本版）
- [ ] テスト: `if-simple`、`each-simple` 系

### Milestone 4: コンポーネント（目標: 60% テスト通過）
- [ ] `component.rs` 実装
- [ ] Props の受け渡し
- [ ] テスト: `component-basic` 系

### Milestone 5: 高度な機能（目標: 70%+ テスト通過）
- [ ] イベントハンドラの完全サポート
- [ ] ディレクティブのサポート
- [ ] `await_block.rs`、`key_block.rs` など
- [ ] `snippet_block.rs` と `render_tag.rs`

## ⚠️ 注意事項

### よくある落とし穴

1. **ノードの順序**: 生成されるコードの順序が重要。公式実装と同じ順序で生成すること。

2. **変数名の衝突**: 生成する変数名（`node`, `text`, `fragment` など）が衝突しないよう注意。

3. **Context の状態管理**: `context.body` に追加するだけでなく、必要に応じて `context.init`、`context.updates` なども使う。

4. **フォーマットの違い**: oxfmt でフォーマットされるため、スペースやセミコロンの違いは無視される。

5. **Template から直接生成**: 一部の要素は `$.from_html()` で HTML 文字列から生成される（パフォーマンス最適化）。

### デバッグのヒント

```bash
# 公式コンパイラで期待される出力を生成
npm run generate-fixtures

# Rust コンパイラで実際の出力を確認
cargo run -- compile [input.svelte]

# diff で違いを確認（oxfmt でフォーマット後）
```

## 🔄 開発ワークフロー

1. **visitor を選ぶ**: 優先順位リストから選択
2. **公式実装を読む**: JS コードを理解
3. **Rust で実装**: パターンに従って実装
4. **テストする**: 簡単なサンプルで確認
5. **コミット**: `git commit -m "feat: implement [visitor_name] for client transform"`
6. **次の visitor へ**: 繰り返し

各 visitor の実装後は必ずコミット・プッシュすること。

## 📊 進捗の追跡

```bash
# テスト結果の更新
npm run compatibility-report

# README の更新
npm run update-docs

# 進捗の確認
cat playground/static/test-results.json | jq '.categories."runtime-runes".stats'
```

## 🎓 学習リソース

- **Svelte 5 ドキュメント**: https://svelte-5-preview.vercel.app/docs
- **Svelte compiler source**: `svelte/packages/svelte/src/compiler/`
- **OXC documentation**: https://oxc.rs/
- **このプロジェクトの既存コード**: 特に `server/visitors/` を参考に

## ✅ チェックリスト

実装前の確認：
- [ ] 公式 Svelte の該当 visitor を読んだ
- [ ] 既存の visitor 実装（server または他の client visitor）を確認した
- [ ] テスト用のシンプルなサンプルを特定した

実装後の確認：
- [ ] コンパイルが通る（`cargo build --lib`）
- [ ] 少なくとも1つのテストサンプルで正しい出力が得られた
- [ ] コードにコメントを付けた（特に複雑な部分）
- [ ] コミット・プッシュした

---

## 💡 最初の一歩

**今すぐ始める場合**:

```bash
# 1. fragment.rs を作成
touch src/compiler/phases/3_transform/client/visitors/fragment.rs

# 2. 公式実装を確認
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js

# 3. 実装開始！
```

**質問や不明点があれば**:
- CLAUDE.md を確認
- 既存コードを grep で検索
- 公式 Svelte のコードを確認

Good luck! 🚀
