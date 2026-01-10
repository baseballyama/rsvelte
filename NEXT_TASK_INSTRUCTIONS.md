# 次のタスク指示書 - Phase 3 Client Visitor 実装

## 📊 現在の状態（2026-01-10）

### ✅ 完了した作業

- `fragment.rs` を公式Svelte実装に合わせて完全に書き直し
- `Template` と `TemplateBuilder` を統一
- `ComponentClientTransformState` に必要なフィールドを全て追加
- ビルドエラーを全て修正

### 📊 テスト結果

| テストスイート | 合格数 | 合格率 | 状態 |
|--------------|--------|--------|------|
| パーサー | 22/22 | 100% | ✅ |
| ユニットテスト | 127/129 | 98% | ✅ |
| コンパイラスナップショット | 15/19 | 79% | 🟡 |
| SSR | 8/80 | 10% | 🔴 |
| Runtime-runes | 0/724 | 0% | 🔴 |

---

## 🎯 次にやるべきこと（優先順位順）

---

## タスク1: `process_children()` 関数の実装【最優先】

### 概要
`fragment.rs` 内の3箇所（214, 228, 232行目）にある `process_children()` のTODOを実装する。

### 参照すべき公式実装
- `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/process.js`
- 特に `process_children()` 関数

### 実装手順

#### 1. 公式実装を読む
```bash
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/process.js
```

#### 2. 新しいファイルを作成
```bash
# 新規作成
touch src/compiler/phases/3_transform/client/visitors/shared/process.rs
```

または既存の `utils.rs` に追加してもOK:
```bash
src/compiler/phases/3_transform/client/visitors/shared/utils.rs
```

#### 3. 実装する関数

以下の関数を実装する必要があります：

```rust
// src/compiler/phases/3_transform/client/visitors/shared/process.rs

use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

/// Process children nodes and generate code.
///
/// # Arguments
///
/// * `nodes` - The child nodes to process
/// * `expression` - Function to generate anchor expression (引数: is_text)
/// * `is_element` - Whether parent is an element
/// * `context` - Component context
/// * `state` - Transform state
pub fn process_children<F>(
    nodes: &[TemplateNode],
    expression: F,
    is_element: bool,
    context: &mut ComponentContext,
    state: &mut ComponentClientTransformState,
) where
    F: Fn(bool) -> JsExpr,
{
    // 公式実装の process_children をここに移植
    // JavaScript の実装を 1行ずつ Rust に翻訳する

    // TODO: 実装する
}
```

#### 4. `mod.rs` を更新
```rust
// src/compiler/phases/3_transform/client/visitors/shared/mod.rs

pub mod component;
pub mod element;
pub mod utils;
pub mod process;  // 追加

pub use process::process_children;  // 追加
```

#### 5. `fragment.rs` のTODOを置き換え

```rust
// fragment.rs 214行目付近
if use_space_template {
    let text_id_name = state.memoizer.generate_id("text");
    let text_id = b::id(&text_id_name);

    // TODO: Implement process_children
    // ↓ これに置き換える
    process_children(&cleaned.trimmed, || text_id.clone(), false, context, &mut state);

    state.init.insert(
        0,
        b::var_decl(&text_id_name, Some(b::call(b::member_path("$.text"), vec![]))),
    );
    // ... 以下省略
}
```

```rust
// fragment.rs 228行目付近
} else if cleaned.is_standalone {
    // No need to create a template, we can just use the existing block's anchor
    // TODO: Implement process_children
    // ↓ これに置き換える
    process_children(&cleaned.trimmed, || b::id("$$anchor"), false, context, &mut state);
} else {
    // ... 以下省略
}
```

```rust
// fragment.rs 232-240行目付近
} else {
    // Standard case with template
    // TODO: Implement process_children
    // ↓ これに置き換える
    let expression = |is_text: bool| {
        if is_text {
            b::call(b::member_path("$.first_child"), vec![id.clone(), b::bool(true)])
        } else {
            b::call(b::member_path("$.first_child"), vec![id.clone()])
        }
    };
    process_children(&cleaned.trimmed, expression, false, context, &mut state);

    // ... 以下省略
}
```

### 期待される効果
- コンパイラスナップショットテストの合格率が向上（79% → 85%+）
- SSRテストの合格率が向上（10% → 30%+）
- Runtime-runesテストが動作し始める（0% → 5%+）

### 確認方法
```bash
cargo build
cargo test --test compiler_fixtures -- --nocapture
cargo test --test ssr -- --nocapture | head -50
```

---

## タスク2: 他の重要なVisitorの実装

### 優先順位

#### 2-1. `text.rs` - テキストノードの処理【高優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Text.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/text.rs`

**実装内容**:
```rust
use crate::ast::template::Text;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a Text node and generate client-side code.
pub fn text(node: &Text, context: &mut ComponentContext) -> JsBlockStatement {
    // 公式実装を参照して実装
    // テキストノードを $.text() で生成するコードを作る

    let id_name = context.state.memoizer.generate_id("text");
    let id = b::id(&id_name);

    // テキストデータを取得
    let data = &node.data;

    // $.text(data) を生成
    context.state.init.push(
        b::var_decl(&id_name, Some(b::call(b::member_path("$.text"), vec![b::string(data)])))
    );

    // $.append($$anchor, text) を生成
    let append_stmt = b::stmt(b::call(
        b::member_path("$.append"),
        vec![b::id("$$anchor"), id],
    ));

    JsBlockStatement {
        body: vec![append_stmt],
    }
}
```

**テスト**:
```bash
cargo build && cargo test --test compiler_fixtures -- --nocapture
```

#### 2-2. `if_block.rs` - if/else ブロックの処理【高優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/IfBlock.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/if_block.rs`

**注意点**:
- `{#if}`, `{:else if}`, `{:else}` の処理
- `$.if()` ランタイム関数を使用
- consequent と alternate の処理

#### 2-3. `each_block.rs` - each ブロックの処理【高優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/EachBlock.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/each_block.rs`

**注意点**:
- `{#each}` ブロックの処理
- `$.each()` ランタイム関数を使用
- key による最適化
- fallback (`:else`) の処理

#### 2-4. `regular_element.rs` - 通常のHTML要素の処理【中優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/regular_element.rs`

**注意点**:
- 通常のHTML要素 (`<div>`, `<span>` など)
- 属性の処理
- イベントハンドラーの処理
- ディレクティブの処理

#### 2-5. `component.rs` - コンポーネントの処理【中優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Component.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/component.rs`

**注意点**:
- Svelte コンポーネントの処理
- props の受け渡し
- slots の処理
- bindings の処理

### 実装手順（各Visitorごと）

1. **公式実装を読む**
   ```bash
   cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/[VisitorName].js
   ```

2. **対応するRustファイルを確認・作成**
   ```bash
   ls src/compiler/phases/3_transform/client/visitors/
   # 存在しない場合は作成
   touch src/compiler/phases/3_transform/client/visitors/[visitor_name].rs
   ```

3. **visitor関数を実装**
   ```rust
   pub fn visitor_name(
       node: &NodeType,
       context: &mut ComponentContext
   ) -> JsBlockStatement {
       // 実装
   }
   ```

4. **`mod.rs` に追加**
   ```rust
   // src/compiler/phases/3_transform/client/visitors/mod.rs
   pub mod visitor_name;
   ```

5. **visitor dispatch を更新**
   - `src/compiler/phases/3_transform/client/visitor.rs` を確認
   - `visit_node()` 関数でノードタイプに応じて適切なvisitorを呼び出す

### 確認方法
```bash
cargo build
cargo test --test compiler_fixtures -- --nocapture
cargo test --test runtime -- --nocapture | head -100
```

---

## タスク3: 失敗しているテストの調査と修正

### コンパイラスナップショットテストの失敗（4件）

**失敗しているテスト**:
1. `nullish-coallescence-omittance` - Client JS mismatch
2. `await-block-scope` - Client JS mismatch
3. `bind-component-snippet` - Client JS mismatch
4. `state-proxy-literal` - Client JS mismatch

### 調査手順

#### 1. テストケースの場所を確認
```bash
find fixtures -type d -name "nullish-coallescence-omittance"
ls fixtures/*/snapshot/nullish-coallescence-omittance/
```

#### 2. ソースと期待される出力を確認
```bash
# 入力ファイル
cat fixtures/*/snapshot/nullish-coallescence-omittance/input.svelte

# 期待されるクライアントコード
cat fixtures/*/snapshot/nullish-coallescence-omittance/_expected/client.js
```

#### 3. 実際の出力を生成して比較
```bash
# テストを実行すると、実際の出力が一時ファイルに保存される
cargo test --test compiler_fixtures test_compiler_snapshot_fixtures -- --nocapture

# または、手動でコンパイルしてみる
# (テストフレームワークが自動比較してくれる)
```

#### 4. 差分の原因を特定

よくある原因：
- `process_children` が未実装
- visitor が未実装（`if_block`, `each_block` など）
- ランタイム関数の呼び出し方が間違っている
- ステートメントの順序が違う

#### 5. 修正を実装

---

## タスク4: SSRテストの改善（現在 8/80）

### 優先度の高い失敗テスト

最初の10件：
1. `bindings-zero`
2. `textarea-value`
3. `select-value-implicit-value-complex`
4. `attribute-boolean`
5. `hydratable-clobbering`
6. `bindings-readonly`
7. `head-title`
8. `css-empty`
9. `bindings-empty-string`
10. `option-scoped-class`

### SSR実装の確認

SSRはサーバーサイドコード生成（HTML文字列を生成するJSコード）なので、クライアントとは異なるアプローチが必要です。

```bash
# SSR実装の確認
ls src/compiler/phases/3_transform/server/
cat src/compiler/phases/3_transform/server/mod.rs
```

### 調査手順

```bash
# テストケースを確認
cat fixtures/*/ssr/bindings-zero/input.svelte
cat fixtures/*/ssr/bindings-zero/_expected/server.js
```

### 注意点

- SSRはクライアント実装が完成してから取り組むのが効率的
- まずはクライアントvisitorを完成させることを優先

---

## 📝 実装時の重要ガイドライン

### 1. 必ず公式実装を参照する
```bash
# 対応するJavaScriptファイルを必ず読む
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/[FileName].js
```

**重要**: 公式実装を1行ずつRustに翻訳する気持ちで。独自の解釈や改良は後回し。

### 2. 型システムを正しく使う

```rust
// ComponentContext を使ってステート管理
context.state.init.push(stmt);
context.state.update.push(stmt);
context.state.hoisted.push(stmt);

// ComponentClientTransformState のフィールド
state.template.push_element(...);
state.memoizer.generate_id("base");
```

### 3. ビルダー関数を活用

```rust
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

// 変数宣言
let stmt = b::var_decl("myVar", Some(b::string("value")));

// 関数呼び出し
let expr = b::call(b::member_path("$.text"), vec![b::string("Hello")]);

// ステートメント
let stmt = b::stmt(expr);
```

### 4. テスト駆動開発

```bash
# 変更のたびにビルドとテストを実行
cargo build
cargo test --test compiler_fixtures -- --nocapture

# 1つのテストが通るごとにコミット
git add .
git commit -m "feat(phase3): Implement text visitor"
git push
```

### 5. 小さくコミット

```bash
# 機能ごと、ファイルごとにコミット
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
git add .
git commit -m "feat(phase3): Implement process_children function

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

---

## 🎯 目標（マイルストーン）

### マイルストーン1: `process_children()` 実装完了 ⭐最優先⭐
- [ ] `process.rs` または `utils.rs` に実装
- [ ] `fragment.rs` のTODOを全て置き換え
- [ ] ビルドが成功
- [ ] コンパイラスナップショット: 15/19 → 17/19 以上 (89%+)

### マイルストーン2: 主要Visitor実装完了
- [ ] `text.rs` 実装
- [ ] `if_block.rs` 実装
- [ ] `each_block.rs` 実装
- [ ] `regular_element.rs` 実装
- [ ] コンパイラスナップショット: 19/19 (100%)

### マイルストーン3: Runtime-runesテスト改善
- [ ] Runtime-runesテスト: 0/724 → 50/724 以上 (7%+)
- [ ] SSRテスト: 8/80 → 30/80 以上 (38%+)

---

## 📚 参考資料

### ディレクトリ構造
```
src/compiler/phases/3_transform/
├── client/
│   ├── mod.rs                     # クライアント変換のエントリーポイント
│   ├── types.rs                   # ComponentClientTransformState など
│   ├── transform_template/
│   │   ├── mod.rs
│   │   ├── index.rs               # transform_template()
│   │   ├── template.rs            # Template struct
│   │   └── types.rs               # Element, Node など
│   └── visitors/
│       ├── mod.rs                 # visitorのエクスポート
│       ├── fragment.rs            # ✅ 実装済み
│       ├── text.rs                # ⚠️ 要実装
│       ├── if_block.rs            # ⚠️ 要実装
│       ├── each_block.rs          # ⚠️ 要実装
│       ├── regular_element.rs     # ⚠️ 要実装
│       ├── component.rs           # ⚠️ 要実装
│       ├── attribute.rs           # 既存
│       ├── program.rs             # 既存
│       └── shared/
│           ├── mod.rs
│           ├── utils.rs           # ヘルパー関数
│           ├── component.rs       # 既存
│           ├── element.rs         # 既存
│           └── process.rs         # ⚠️ 新規作成が必要
└── server/
    └── mod.rs                     # サーバー変換（SSR）
```

### 公式実装の対応
```
svelte/packages/svelte/src/compiler/phases/3-transform/client/
└── visitors/
    ├── Fragment.js            → fragment.rs ✅ 実装済み
    ├── Text.js                → text.rs ⚠️ 要実装
    ├── IfBlock.js             → if_block.rs ⚠️ 要実装
    ├── EachBlock.js           → each_block.rs ⚠️ 要実装
    ├── RegularElement.js      → regular_element.rs ⚠️ 要実装
    ├── Component.js           → component.rs ⚠️ 要実装
    └── shared/
        └── process.js         → process.rs ⚠️ 要実装
```

### 有用なコマンド

```bash
# ビルド確認
cargo build

# 全テスト実行
cargo test --lib

# 特定のテストスイート
cargo test --test compiler_fixtures -- --nocapture
cargo test --test ssr -- --nocapture
cargo test --test runtime -- --nocapture | head -100

# フォーマットとリント
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings

# 公式実装の確認
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/[FileName].js

# テストケースの確認
cat fixtures/*/snapshot/[test-name]/input.svelte
cat fixtures/*/snapshot/[test-name]/_expected/client.js
```

---

## ✅ 完了チェックリスト

### タスク1: process_children()
- [ ] 公式実装 `process.js` を読んで理解
- [ ] `process.rs` ファイル作成
- [ ] `process_children()` 関数実装
- [ ] `fragment.rs` のTODO（3箇所）を置き換え
- [ ] ビルド成功
- [ ] テスト実行して改善確認
- [ ] コミット＆プッシュ

### タスク2: Visitor実装
- [ ] `text.rs` 実装完了
- [ ] `if_block.rs` 実装完了
- [ ] `each_block.rs` 実装完了
- [ ] `regular_element.rs` 実装完了
- [ ] `component.rs` 実装完了
- [ ] 各実装後にコミット＆プッシュ

### タスク3: テスト修正
- [ ] 失敗している4つのスナップショットテストを調査
- [ ] 原因特定
- [ ] 修正実装
- [ ] 全テスト合格確認

---

## 💡 Tips

### 1. 一度に1つのタスクに集中する
まずは `process_children()` を完全に実装してから次のvisitorに進む。

### 2. 公式実装を完全にコピーする気持ちで
独自の解釈や改良は後回し。まずは100%互換性を目指す。

### 3. テストを頻繁に実行
変更のたびにビルドとテストを実行。後退に早く気づく。

### 4. 小さくコミット
機能ごと、ファイルごとにコミット。いつでも戻れるように。

### 5. 詰まったら公式実装を再読
JavaScriptのロジックを1行ずつRustに翻訳。わからない部分は周辺コードも読む。

### 6. デバッグ出力を活用
```rust
eprintln!("DEBUG: process_children called with {} nodes", nodes.len());
eprintln!("DEBUG: Generated expression: {:?}", expr);
```

---

## 🔍 デバッグ方法

### テストが失敗した場合

1. **期待される出力を確認**
   ```bash
   cat fixtures/*/snapshot/[test-name]/_expected/client.js
   ```

2. **実際の出力を確認**
   - テスト実行時に一時ファイルに保存される
   - または `eprintln!` でデバッグ出力

3. **差分を比較**
   - 何が違うのか（関数呼び出し、順序、変数名など）
   - なぜ違うのか（未実装の機能、ロジックの違いなど）

4. **公式実装を再確認**
   - 該当箇所のJavaScriptコードを読む
   - ロジックをRustに正確に翻訳

### ビルドエラーが出た場合

1. **エラーメッセージを注意深く読む**
   ```bash
   cargo build 2>&1 | head -50
   ```

2. **型が合わない場合**
   - `types.rs` で型定義を確認
   - builders を確認（`js_ast/builders.rs`）

3. **インポートエラーの場合**
   - `mod.rs` でモジュール宣言を確認
   - `use` 文のパスを確認

---

**作成日**: 2026-01-10
**次回更新**: タスク1完了後
**推奨作業時間**: 3-4時間（`process_children` 実装に2時間、visitor実装に2時間）
