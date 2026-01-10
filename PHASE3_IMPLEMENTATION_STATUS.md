# Phase 3 Transform 実装状況と修正指示書

## 実装完了日
2026-01-10

## 概要

Phase 3 Transform の client visitor 第1バッチ（8ファイル）の並列実装を完了しましたが、既存のコードベース構造との不整合により、**30個のコンパイルエラーと37個の警告**が発生しています。

## 実装完了したファイル

### Client Visitors (8ファイル)

1. ✅ **fragment.rs** - Fragment visitor
   - 状態: 実装完了、コンパイルエラーあり
   - エージェントID: accd87b

2. ✅ **regular_element.rs** - RegularElement visitor (スケルトン実装)
   - 状態: 骨組み実装完了、コンパイル成功
   - エージェントID: a1c4165

3. ✅ **if_block.rs** - IfBlock visitor
   - 状態: 実装完了、コンパイル成功
   - エージェントID: a0ae9dd

4. ✅ **each_block.rs** - EachBlock visitor
   - 状態: 実装完了、警告のみ
   - エージェントID: a04941a

5. ✅ **component.rs** - Component visitor
   - 状態: 実装完了、コンパイル成功
   - エージェントID: a925a68

6. ✅ **attribute.rs** - Attribute visitor
   - 状態: 実装完了、コンパイル成功
   - エージェントID: a7e4b83

7. ✅ **program.rs** - Program visitor
   - 状態: 実装完了、コンパイル成功
   - エージェントID: af18890

8. ✅ **utils.rs** - ユーティリティ関数
   - 状態: 実装完了、コンパイル成功
   - エージェントID: a2980ef

### その他の追加/修正ファイル

- ✅ `src/compiler/constants.rs` - 定数定義（EACH_*, PROPS_IS_*）
- ✅ `src/compiler/phases/3_transform/js_ast/builders.rs` - ビルダー関数の拡張
- ✅ `src/compiler/phases/2_analyze/types.rs` - 型定義の拡張

## 現在のビルドエラー分析

### エラーカテゴリ別集計

| エラーコード | 件数 | 説明 |
|-------------|------|------|
| E0308 | 8 | 型の不一致 |
| E0599 | 3 | メソッド `generate_unique_name` が存在しない |
| E0061 | 3 | 関数引数の数が不一致 |
| E0609 | 6 | フィールドが存在しない（`nodes`, `needs_import_node`, `metadata`） |
| E0560 | 1 | 構造体フィールドが存在しない（`span`） |
| E0382 | 1 | 値の移動後の借用エラー |
| E0277 | 1 | トレイト境界が満たされていない |
| E0271 | 1 | 型の不一致（イテレータ） |
| その他 | 6 | その他のエラー |
| **合計** | **30** | **コンパイルエラー** |

### 警告の内訳

- 未使用変数: 25件
- 未使用インポート: 3件
- 到達不可能なパターン: 1件
- その他: 8件
- **合計: 37件の警告**

## 主要な問題点と修正方法

### 1. `ScopeRoot::generate_unique_name()` メソッドが存在しない（3箇所）

**影響ファイル:**
- `src/compiler/phases/3_transform/client/visitors/fragment.rs`
- その他の visitor ファイル

**現状:**
```rust
let id_name = context.state.scope_root.generate_unique_name(element.name.to_string());
```

**修正方法:**

#### オプション A: ScopeRoot に `generate_unique_name()` メソッドを実装

```rust
// src/compiler/phases/2_analyze/scope.rs

impl ScopeRoot {
    /// Generate a unique name based on the given base name.
    /// Ensures the name doesn't conflict with existing bindings.
    pub fn generate_unique_name(&self, base: String) -> String {
        let mut name = base.clone();
        let mut counter = 1;

        while self.bindings.iter().any(|b| b.name == name) {
            name = format!("{}_{}", base, counter);
            counter += 1;
        }

        name
    }
}
```

#### オプション B: Memoizer の `generate_id()` を使用（現在の一時対応）

```rust
// 一時的な回避策（fragment.rs で既に実装済み）
let id_name = format!("{}_{}", element.name, state.memoizer.generate_id());
```

**推奨:** オプション A を実装し、全ての箇所で統一的に使用する。

### 2. `TemplateBuilder` の構造不一致（6箇所）

**影響フィールド:**
- `needs_import_node`
- `nodes`
- `metadata`

**現状:** JavaScript 版の Template オブジェクトと Rust 版の TemplateBuilder の構造が異なる。

**修正方法:**

#### ステップ 1: `TemplateBuilder` の定義を確認

```rust
// src/compiler/phases/3_transform/client/transform_template/types.rs を確認
pub struct TemplateBuilder {
    // 現在のフィールドを確認
}
```

#### ステップ 2: 不足しているフィールドを追加

JavaScript 版と比較して、以下のフィールドが必要かチェック：

```rust
pub struct TemplateBuilder {
    // 既存のフィールド...

    /// Whether this template needs to import the node runtime function
    pub needs_import_node: bool,

    /// Generated template nodes (for debugging/inspection)
    pub nodes: Vec<TemplateNode>,

    /// Component metadata (scoping, namespace, etc.)
    pub metadata: ComponentMetadata,
}
```

#### ステップ 3: 全ての visitor でフィールドを使用

各 visitor で `TemplateBuilder` の新しいフィールドにアクセスする箇所を修正。

**推奨:** JavaScript の `template.js` と Rust の `TemplateBuilder` を行単位で比較し、完全に構造を一致させる。

### 3. `RegularElement` に `metadata` フィールドがない（2箇所）

**影響ファイル:**
- regular_element.rs などの visitor

**現状:**
```rust
if let Some(metadata) = &element.metadata {
    // metadata を使用
}
```

**問題:** `RegularElement` 構造体に `metadata` フィールドが定義されていない。

**修正方法:**

#### ステップ 1: JavaScript 版の構造を確認

```javascript
// svelte/packages/svelte/src/compiler/phases/2-analyze/types.d.ts
export interface RegularElement {
  // ...
  metadata?: ElementMetadata;
}
```

#### ステップ 2: Rust の AST 定義に追加

```rust
// src/ast/template.rs

#[derive(Debug, Clone)]
pub struct RegularElement {
    // 既存のフィールド...

    /// Element metadata (added by phase 2 analysis)
    pub metadata: Option<ElementMetadata>,
}

#[derive(Debug, Clone)]
pub struct ElementMetadata {
    pub scoped: bool,
    // その他のフィールド...
}
```

#### ステップ 3: Phase 2 で metadata を設定

Phase 2 の analysis で `metadata` を適切に設定する処理を追加。

**推奨:** JavaScript 版の `RegularElement` と完全に一致させる。

### 4. `JsBlockStatement` の `span` フィールド（1箇所）

**現状:**
```rust
JsBlockStatement {
    body: statements,
    span: None,  // ← このフィールドは存在しない
}
```

**修正:** ✅ 既に修正済み（`span` フィールドを削除）

### 5. 関数引数の不一致（3箇所）

**問題例:**
```rust
// 期待: 4引数
transform_template(a, b, c, d)

// 実際: 3引数で呼び出し
transform_template(a, b, c)
```

**修正方法:**

#### ステップ 1: 関数定義を確認

```bash
grep -n "fn transform_template" src/compiler/phases/3_transform/client/transform_template/index.rs
```

#### ステップ 2: 呼び出し箇所を修正

関数シグネチャに合わせて引数を追加または削除。

**推奨:** 各エラーメッセージから該当ファイルと行番号を特定し、個別に修正。

### 6. 型の不一致（8箇所）

主なケース：

#### ケース A: `CompactString` vs `String`

```rust
// エラー: the trait bound `String: From<&CompactString>` is not satisfied
let s: String = compact_string.into();  // NG

// 修正:
let s: String = compact_string.to_string();  // OK
```

#### ケース B: `JsExpressionStatement` vs `JsStatement`

```rust
// エラー:
let statements: Vec<JsStatement> = expr_statements;  // NG

// 修正:
let statements: Vec<JsStatement> = expr_statements
    .into_iter()
    .map(|e| JsStatement::Expression(e))
    .collect();  // OK
```

#### ケース C: `Template` vs `TemplateBuilder`

```rust
// エラー:
template: Template::new(),  // NG

// 修正:
template: TemplateBuilder::new(),  // OK
```

**推奨:** コンパイラのエラーメッセージから該当箇所を特定し、型を正しく変換。

## 未実装の Client Visitors（44ファイル）

次のバッチで実装すべきファイル：

### 優先度: 高（コアブロック/タグ）

1. `AwaitBlock.js` → `await_block.rs`
2. `KeyBlock.js` → `key_block.rs`
3. `SnippetBlock.js` → `snippet_block.rs`
4. `HtmlTag.js` → `html_tag.rs`
5. `RenderTag.js` → `render_tag.rs`
6. `ConstTag.js` → `const_tag.rs`
7. `DebugTag.js` → `debug_tag.rs`
8. `Comment.js` → `comment.rs`

### 優先度: 中（ディレクティブ）

9. `BindDirective.js` → `bind_directive.rs`
10. `OnDirective.js` → `on_directive.rs`
11. `UseDirective.js` → `use_directive.rs`
12. `TransitionDirective.js` → `transition_directive.rs`
13. `LetDirective.js` → `let_directive.rs`
14. `SpreadAttribute.js` → `spread_attribute.rs`

### 優先度: 中（特殊要素）

15. `SvelteElement.js` → `svelte_element.rs`
16. `SvelteComponent.js` → `svelte_component.rs`
17. `SvelteSelf.js` → `svelte_self.rs`
18. `SvelteFragment.js` → `svelte_fragment.rs`
19. `SlotElement.js` → `slot_element.rs`
20. `TitleElement.js` → `title_element.rs`
21. `SvelteHead.js` → `svelte_head.rs`
22. `SvelteBody.js` → `svelte_body.rs`
23. `SvelteWindow.js` → `svelte_window.rs`
24. `SvelteDocument.js` → `svelte_document.rs`
25. `SvelteBoundary.js` → `svelte_boundary.rs`
26. `AttachTag.js` → `attach_tag.rs`

### 優先度: 低（JS式のトランスフォーム）

27. `Identifier.js` → `identifier.rs`
28. `MemberExpression.js` → `member_expression.rs`
29. `CallExpression.js` → `call_expression.rs`
30. `BinaryExpression.js` → `binary_expression.rs`
31. `UpdateExpression.js` → `update_expression.rs`
32. `AwaitExpression.js` → `await_expression.rs`

### 優先度: 低（JS文のトランスフォーム）

33. `VariableDeclaration.js` → `variable_declaration.rs`
34. `FunctionDeclaration.js` → `function_declaration.rs`
35. `FunctionExpression.js` → `function_expression.rs`
36. `ExpressionStatement.js` → `expression_statement.rs`
37. `BlockStatement.js` → `block_statement.rs`
38. `BreakStatement.js` → `break_statement.rs`
39. `LabeledStatement.js` → `labeled_statement.rs`
40. `ForOfStatement.js` → `for_of_statement.rs`
41. `ExportNamedDeclaration.js` → `export_named_declaration.rs`
42. `ClassBody.js` → `class_body.rs`

### その他

43. `transform-client.js` → `transform_client.rs`（メイン変換ロジック）
44. `types.d.ts` → 既に types.rs に部分的に実装済み

## Server Visitors（未着手・30+ファイル）

Server側の visitor も同様に実装が必要：

### Shared

- `server/visitors/shared/component.js`
- `server/visitors/shared/element.js`
- `server/visitors/shared/utils.js`

### Visitors

- `server/visitors/AssignmentExpression.js`
- `server/visitors/AwaitBlock.js`
- `server/visitors/CallExpression.js`
- `server/visitors/Component.js`
- （以下、約30ファイル）

## 次のステップ（優先順位順）

### ステップ 1: ビルドエラーの完全修正 ⚠️ **最優先**

1. `ScopeRoot::generate_unique_name()` メソッドを実装（3箇所のエラー解消）
2. `TemplateBuilder` に不足フィールドを追加（6箇所のエラー解消）
3. `RegularElement` に `metadata` フィールドを追加（2箇所のエラー解消）
4. 型の不一致を修正（8箇所）
5. 関数引数の不一致を修正（3箇所）
6. その他のエラーを修正（8箇所）

**目標:** `cargo build` が成功する状態にする。

### ステップ 2: Validator テストの実行

```bash
cargo test --test validator 2>&1 | tee validator_results.txt
```

現在のテスト通過状況を確認。

### ステップ 3: 第2バッチの実装（優先度: 高の8ファイル）

ビルドが成功したら、次の8ファイルを並列実装：

1. AwaitBlock.js
2. KeyBlock.js
3. SnippetBlock.js
4. HtmlTag.js
5. RenderTag.js
6. ConstTag.js
7. DebugTag.js
8. Comment.js

**重要:** 第2バッチでは、既存のコードベース構造を完全に理解してから実装する。

### ステップ 4: 段階的な実装継続

- 第3バッチ（ディレクティブ系）
- 第4バッチ（特殊要素系）
- 第5バッチ（JS式/文系）
- Server visitor の実装

### ステップ 5: テスト合格率の向上

各バッチ完了後に validator テストを実行し、合格率を確認。

## 移植時の注意点（今後の実装のために）

### 1. 既存構造の完全理解

新しい visitor を実装する前に：

```bash
# 関連する型定義を確認
rg "struct RegularElement" src/ast/
rg "struct ComponentClientTransformState" src/compiler/phases/3_transform/client/

# 既存の実装例を確認
cat src/compiler/phases/3_transform/client/visitors/component.rs
```

### 2. JavaScript との対応付け

JavaScript のコードを行単位で追跡：

```javascript
// JavaScript (svelte)
function visitRegularElement(node, context) {
    const attributes = node.attributes;
    // ...
}
```

↓

```rust
// Rust
pub fn visit_regular_element(
    node: &RegularElement,
    context: &mut ComponentContext,
) -> Result<()> {
    let attributes = &node.attributes;
    // ...
}
```

### 3. 型の厳密性

Rust は型に厳密なので：

- `Option<T>` vs `T` を正しく区別
- `&str` vs `String` vs `CompactString` を適切に変換
- `Vec<JsStatement>` vs `Vec<JsExpressionStatement>` を区別

### 4. 所有権とライフタイム

- 不要なクローンを避ける（参照で済む場合は参照を使用）
- ただし、可読性とメンテナンス性を優先
- 複雑なライフタイムは避け、必要なら `'static` や `Arc` を検討

### 5. エラーハンドリング

- `Result<T, E>` を適切に返す
- `?` 演算子を活用
- JavaScript の throw と Rust の `Err()` を対応付け

## 成果物

### 追加されたファイル（14ファイル）

```
src/compiler/constants.rs
src/compiler/phases/3_transform/client/visitors/fragment.rs
src/compiler/phases/3_transform/client/visitors/regular_element.rs
src/compiler/phases/3_transform/client/visitors/if_block.rs
src/compiler/phases/3_transform/client/visitors/each_block.rs
src/compiler/phases/3_transform/client/visitors/component.rs
src/compiler/phases/3_transform/client/visitors/attribute.rs
src/compiler/phases/3_transform/client/visitors/program.rs
```

### 修正されたファイル（7ファイル）

```
src/compiler/mod.rs
src/compiler/phases/2_analyze/types.rs
src/compiler/phases/2_analyze/visitors/labeled_statement.rs
src/compiler/phases/3_transform/client/types.rs
src/compiler/phases/3_transform/client/utils.rs
src/compiler/phases/3_transform/client/visitors/mod.rs
src/compiler/phases/3_transform/js_ast/builders.rs
src/compiler/phases/3_transform/client/transform_template/fix_attribute_casing.rs
src/compiler/phases/3_transform/client/visitors/shared/utils.rs
```

## まとめ

Phase 3 Transform の第1バッチ実装は完了しましたが、既存コードベースとの構造的不一致により30個のコンパイルエラーが発生しています。

**次の最優先タスク:** ビルドエラーの完全修正

その後、validator テストで現状を確認し、第2バッチ以降の実装を進めます。

---

**作成日:** 2026-01-10
**最終更新:** 2026-01-10
