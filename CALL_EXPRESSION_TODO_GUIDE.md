# CallExpression.rs TODO 解消ガイド

このガイドでは、`src/compiler/phases/2_analyze/visitors/call_expression.rs` に残された TODO を解消するための実装手順を説明します。

## 概要

現在の実装では、以下の3つの主要な TODO が残されています：

1. **JavaScript AST パス追跡** - JS 式のノードパスを visitor context に追加
2. **Expression メタデータ** - 式の状態を追跡するメタデータシステム
3. **Placement 検証** - rune の配置位置を正確に検証

## 前提条件

Phase 2 の visitor は現在、**template ノード（Svelte AST）** のみを追跡しています。しかし、CallExpression などの **JavaScript 式ノード** を適切に検証するには、JS AST のパスも追跡する必要があります。

## TODO 1: JavaScript AST パス追跡

### 目的

VisitorContext に JavaScript AST ノードのパスを追加し、`get_parent()` で親ノードを取得できるようにします。

### 実装手順

#### 1.1 VisitorContext に JS パスフィールドを追加

**ファイル:** `src/compiler/phases/2_analyze/visitors/mod.rs`

```rust
pub struct VisitorContext<'a> {
    // 既存フィールド...

    /// Template node path (Svelte AST)
    pub path: Vec<&'a TemplateNode>,

    /// JavaScript AST node path (for expressions in scripts)
    /// This is a stack of serde_json::Value representing JS AST nodes
    pub js_path: Vec<Value>,

    // 他のフィールド...
}
```

**初期化:**

```rust
impl<'a> VisitorContext<'a> {
    pub fn new(analysis: &'a mut ComponentAnalysis) -> Self {
        Self {
            // 既存の初期化...
            path: Vec::new(),
            js_path: Vec::new(),  // 追加
            // 他のフィールド...
        }
    }
}
```

#### 1.2 Script 解析時に JS パスを構築

Phase 2 では現在、script の内容を直接解析していません。script は Phase 1 で JSON として保存されています。

**実装アプローチ:**

Option A: **Phase 2 で script を再解析** (推奨)
- `ComponentAnalysis::instance` フィールドの script 内容を走査
- JavaScript visitor を実装して JS AST を辿る

Option B: **Phase 1 で JS パス情報を事前計算**
- Phase 1 の時点で各 CallExpression の親情報を記録
- Phase 2 で読み取る

**Option A の実装例:**

```rust
// src/compiler/phases/2_analyze/visitors/script.rs (新規作成)

use serde_json::Value;
use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;

/// Visit a JavaScript script content
pub fn visit_script(
    script_content: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    walk_js_node(script_content, context)?;
    Ok(())
}

/// Recursively walk JavaScript AST nodes
fn walk_js_node(
    node: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let node_type = node.get("type").and_then(|t| t.as_str());

    // Push to JS path
    context.js_path.push(node.clone());

    match node_type {
        Some("CallExpression") => {
            // Visit CallExpression
            super::call_expression::visit(node, context)?;
        }
        Some("VariableDeclarator") => {
            super::variable_declarator::visit(node, context)?;
        }
        Some("FunctionDeclaration") | Some("FunctionExpression") | Some("ArrowFunctionExpression") => {
            super::function_declaration::visit(node, context)?;
        }
        // 他の JS ノードタイプ...
        _ => {}
    }

    // Visit children
    visit_children(node, context)?;

    // Pop from JS path
    context.js_path.pop();

    Ok(())
}

fn visit_children(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // body, expression, arguments などの子ノードを走査
    if let Some(body) = node.get("body") {
        if body.is_array() {
            for child in body.as_array().unwrap() {
                walk_js_node(child, context)?;
            }
        } else {
            walk_js_node(body, context)?;
        }
    }

    if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
        for arg in arguments {
            walk_js_node(arg, context)?;
        }
    }

    // 他の子フィールド...

    Ok(())
}
```

#### 1.3 get_parent() の実装

**ファイル:** `src/compiler/phases/2_analyze/visitors/call_expression.rs`

```rust
/// Get the parent node at a specific offset in the path.
///
/// # Arguments
///
/// * `context` - The visitor context
/// * `offset` - The offset from the end (1 for immediate parent, 2 for grandparent, etc.)
fn get_parent(context: &VisitorContext, offset: usize) -> Option<&Value> {
    let index = context.js_path.len().checked_sub(offset + 1)?;
    context.js_path.get(index)
}
```

### 検証方法

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_parent() {
        // テストコード
        // JS パスに複数のノードを追加
        // get_parent(context, 1) が正しい親を返すことを確認
    }
}
```

---

## TODO 2: Expression メタデータ

### 目的

式の状態（`has_call`, `has_state`, `has_await` など）を追跡するメタデータシステムを実装します。

### 実装手順

#### 2.1 ExpressionMetadata 構造体の定義

**ファイル:** `src/compiler/phases/2_analyze/types.rs`

```rust
/// Metadata about an expression for dependency tracking
#[derive(Debug, Default, Clone)]
pub struct ExpressionMetadata {
    /// Whether the expression contains a function call
    pub has_call: bool,

    /// Whether the expression references stateful variables
    pub has_state: bool,

    /// Whether the expression contains await
    pub has_await: bool,

    /// Bindings referenced by this expression
    pub dependencies: HashSet<String>,

    /// References to specific bindings
    pub references: HashSet<usize>, // binding indices
}

impl ExpressionMetadata {
    pub fn new() -> Self {
        Self::default()
    }

    /// Mark that this expression has a call
    pub fn mark_has_call(&mut self) {
        self.has_call = true;
    }

    /// Mark that this expression references state
    pub fn mark_has_state(&mut self) {
        self.has_state = true;
    }

    /// Mark that this expression contains await
    pub fn mark_has_await(&mut self) {
        self.has_await = true;
    }

    /// Add a dependency
    pub fn add_dependency(&mut self, name: String) {
        self.dependencies.insert(name);
    }
}
```

#### 2.2 VisitorContext にメタデータスタックを追加

**ファイル:** `src/compiler/phases/2_analyze/visitors/mod.rs`

```rust
pub struct VisitorContext<'a> {
    // 既存フィールド...

    /// Stack of expression metadata (for nested expressions)
    pub expression_stack: Vec<ExpressionMetadata>,

    // 他のフィールド...
}
```

#### 2.3 Expression visitor でメタデータを構築

**$derived の例:**

```rust
// call_expression.rs 内

Some("$derived") => {
    // ... 既存の検証コード ...

    // Create new expression metadata for the $derived function
    let mut expression = ExpressionMetadata::new();
    context.expression_stack.push(expression);

    // Increment function depth
    let original_depth = context.function_depth;
    context.function_depth += 1;

    // Visit the argument (the derived expression)
    if let Some(arg) = node
        .get("arguments")
        .and_then(|a| a.as_array())
        .and_then(|a| a.first())
    {
        walk_js_node(arg, context)?;
    }

    // Restore function depth
    context.function_depth = original_depth;

    // Pop expression and check for async
    if let Some(expression) = context.expression_stack.pop() {
        if expression.has_await {
            // This is an async derived
            let node_id = format!("{:?}", node); // TODO: Better ID
            context.analysis.async_deriveds.insert(node_id);
        }
    }
}
```

**AwaitExpression の例:**

```rust
// await_expression.rs

pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Mark the current expression as having await
    if let Some(expression) = context.expression_stack.last_mut() {
        expression.mark_has_await();
    }

    // Visit the argument
    if let Some(argument) = node.get("argument") {
        walk_js_node(argument, context)?;
    }

    Ok(())
}
```

**CallExpression での has_call/has_state の追跡:**

```rust
// call_expression.rs の最後に追加

pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // ... 既存の rune 検証コード ...

    // Track expression metadata
    if let Some(expression) = context.expression_stack.last_mut() {
        if let Some(callee) = node.get("callee") {
            let is_pure_call = super::shared::utils::is_pure(node, context);
            let has_dependencies = !expression.dependencies.is_empty();

            if !is_pure_call || has_dependencies {
                expression.mark_has_call();
                expression.mark_has_state();
            }
        }
    }

    Ok(())
}
```

#### 2.4 Identifier visitor で dependencies を追跡

**ファイル:** `src/compiler/phases/2_analyze/visitors/identifier.rs`

```rust
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let name = node.get("name").and_then(|n| n.as_str());

    if let Some(name) = name {
        // Add to expression dependencies
        if let Some(expression) = context.expression_stack.last_mut() {
            expression.add_dependency(name.to_string());
        }

        // Check if it's a state binding
        if let Some(binding_idx) = context.analysis.root.scope.declarations.get(name) {
            let binding = &context.analysis.root.bindings[*binding_idx];

            if binding.kind.is_rune() {
                if let Some(expression) = context.expression_stack.last_mut() {
                    expression.mark_has_state();
                    expression.references.insert(*binding_idx);
                }
            }
        }
    }

    Ok(())
}
```

---

## TODO 3: Placement 検証

### 目的

各 rune の配置位置を正確に検証します。

### 実装手順

#### 3.1 is_bindable_valid_placement の実装

**要件:**
- AssignmentPattern の中
- ObjectPattern の中
- VariableDeclarator の中
- init が $props() 呼び出し

```rust
fn is_bindable_valid_placement(context: &VisitorContext) -> bool {
    // Check path: [..., VariableDeclarator, ObjectPattern, AssignmentPattern, CallExpression]
    let len = context.js_path.len();

    if len < 4 {
        return false;
    }

    // Current node should be CallExpression ($bindable call)
    // Parent should be AssignmentPattern
    let parent = get_parent(context, 1);
    if parent.and_then(|p| p.get("type")).and_then(|t| t.as_str()) != Some("AssignmentPattern") {
        return false;
    }

    // Grandparent should be ObjectPattern
    let grandparent = get_parent(context, 2);
    if grandparent.and_then(|p| p.get("type")).and_then(|t| t.as_str()) != Some("ObjectPattern") {
        return false;
    }

    // Great-grandparent should be VariableDeclarator
    let great_grandparent = get_parent(context, 3);
    if great_grandparent.and_then(|p| p.get("type")).and_then(|t| t.as_str()) != Some("VariableDeclarator") {
        return false;
    }

    // Check that VariableDeclarator init is $props()
    if let Some(init) = great_grandparent.and_then(|p| p.get("init")) {
        let rune = get_rune(init, context);
        return rune.as_deref() == Some("$props");
    }

    false
}
```

#### 3.2 is_props_valid_placement の実装

**要件:**
- VariableDeclarator の中
- instance script の最上位レベル
- ConstTag の中ではない

```rust
fn is_props_valid_placement(context: &VisitorContext) -> bool {
    // Parent must be VariableDeclarator
    let parent = get_parent(context, 1);
    if parent.and_then(|p| p.get("type")).and_then(|t| t.as_str()) != Some("VariableDeclarator") {
        return false;
    }

    // Check we're in instance script scope
    // TODO: Add ast_type to context to check if we're in 'instance' vs 'module'
    // For now, check that we're at the root scope
    if context.scope != 0 {
        return false;
    }

    // Check we're not inside a ConstTag (template node)
    // ConstTag appears in template path, not JS path
    for node in &context.path {
        if matches!(node, TemplateNode::ConstTag(_)) {
            return false;
        }
    }

    true
}
```

#### 3.3 is_state_or_derived_valid_placement の実装

**要件:**
- VariableDeclarator (ConstTag の中でない)
- PropertyDefinition (non-static, non-computed)
- AssignmentExpression (constructor 内で this.property = $state())

```rust
fn is_state_or_derived_valid_placement(context: &VisitorContext) -> bool {
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    let parent_type = parent.get("type").and_then(|t| t.as_str());

    match parent_type {
        Some("VariableDeclarator") => {
            // Check not in ConstTag
            let great_grandparent = get_parent(context, 3);
            let is_const_tag = context.path.iter()
                .any(|n| matches!(n, TemplateNode::ConstTag(_)));
            !is_const_tag
        }

        Some("PropertyDefinition") => {
            // Must be non-static and non-computed
            let is_static = parent.get("static").and_then(|s| s.as_bool()).unwrap_or(false);
            let is_computed = parent.get("computed").and_then(|c| c.as_bool()).unwrap_or(false);
            !is_static && !is_computed
        }

        Some("AssignmentExpression") => {
            is_class_property_assignment_at_constructor_root(parent, context)
        }

        _ => false,
    }
}

/// Check if assignment is `this.property = $state(...)` at constructor root
fn is_class_property_assignment_at_constructor_root(
    node: &Value,
    context: &VisitorContext,
) -> bool {
    // Check assignment operator is '='
    if node.get("operator").and_then(|o| o.as_str()) != Some("=") {
        return false;
    }

    // Check left side is MemberExpression with 'this'
    let left = match node.get("left") {
        Some(l) => l,
        None => return false,
    };

    if left.get("type").and_then(|t| t.as_str()) != Some("MemberExpression") {
        return false;
    }

    let object = left.get("object");
    if object.and_then(|o| o.get("type")).and_then(|t| t.as_str()) != Some("ThisExpression") {
        return false;
    }

    // Check property is Identifier, PrivateIdentifier, or Literal
    let property = left.get("property");
    let property_type = property.and_then(|p| p.get("type")).and_then(|t| t.as_str());
    let is_computed = left.get("computed").and_then(|c| c.as_bool()).unwrap_or(false);

    if !matches!(property_type, Some("Identifier") | Some("PrivateIdentifier") | Some("Literal")) {
        if property_type != Some("Identifier") || is_computed {
            return false;
        }
    }

    // Check path: AssignmentExpression (-1) -> ExpressionStatement (-2) ->
    //             BlockStatement (-3) -> FunctionExpression (-4) -> MethodDefinition (-5)
    let parent_5 = get_parent(context, 5);
    if parent_5.and_then(|p| p.get("type")).and_then(|t| t.as_str()) != Some("MethodDefinition") {
        return false;
    }

    // Check it's a constructor
    parent_5.and_then(|p| p.get("kind")).and_then(|k| k.as_str()) == Some("constructor")
}
```

#### 3.4 is_effect_valid_placement の実装

**要件:**
- ExpressionStatement の中

```rust
fn is_effect_valid_placement(context: &VisitorContext) -> bool {
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    parent.get("type").and_then(|t| t.as_str()) == Some("ExpressionStatement")
}
```

#### 3.5 is_inspect_trace_valid_placement の実装

**要件:**
- ExpressionStatement の中
- BlockStatement の中
- 関数の最初のステートメント

```rust
fn is_inspect_trace_valid_placement(context: &VisitorContext) -> bool {
    // Parent: ExpressionStatement
    let parent = match get_parent(context, 1) {
        Some(p) => p,
        None => return false,
    };

    if parent.get("type").and_then(|t| t.as_str()) != Some("ExpressionStatement") {
        return false;
    }

    // Grandparent: BlockStatement
    let grandparent = match get_parent(context, 2) {
        Some(p) => p,
        None => return false,
    };

    if grandparent.get("type").and_then(|t| t.as_str()) != Some("BlockStatement") {
        return false;
    }

    // Great-grandparent: Function (FunctionDeclaration, FunctionExpression, or ArrowFunctionExpression)
    let fn_node = match get_parent(context, 3) {
        Some(p) => p,
        None => return false,
    };

    let fn_type = fn_node.get("type").and_then(|t| t.as_str());
    if !matches!(
        fn_type,
        Some("FunctionDeclaration") | Some("FunctionExpression") | Some("ArrowFunctionExpression")
    ) {
        return false;
    }

    // Check it's the first statement in the block
    if let Some(body) = grandparent.get("body").and_then(|b| b.as_array()) {
        if let Some(first) = body.first() {
            // Compare pointers (this is tricky with serde_json::Value)
            // For now, compare serialized forms
            return serde_json::to_string(first).ok() == serde_json::to_string(parent).ok();
        }
    }

    false
}
```

#### 3.6 is_inside_generator_function の実装

```rust
fn is_inside_generator_function(context: &VisitorContext) -> bool {
    // Walk up the JS path to find a function
    for node in context.js_path.iter().rev() {
        let node_type = node.get("type").and_then(|t| t.as_str());

        if matches!(
            node_type,
            Some("FunctionDeclaration") | Some("FunctionExpression")
        ) {
            // Check if it's a generator
            if node.get("generator").and_then(|g| g.as_bool()).unwrap_or(false) {
                return true;
            }

            // Stop at first function (don't check outer functions)
            return false;
        }
    }

    false
}
```

---

## 統合手順

### Step 1: JS パス追跡を実装

1. `VisitorContext` に `js_path` フィールドを追加
2. `script.rs` で JS AST walker を実装
3. `get_parent()` を実装して動作確認

### Step 2: Expression メタデータを実装

1. `ExpressionMetadata` 構造体を追加
2. `VisitorContext` に `expression_stack` を追加
3. 各 visitor (`await_expression.rs`, `identifier.rs` など) でメタデータを更新
4. `$derived` での async 検出を実装

### Step 3: Placement 検証を実装

1. 各 `is_*_valid_placement` 関数を実装
2. テストケースを追加
3. エラーメッセージが正しく表示されることを確認

### Step 4: テスト

```bash
# 各ステップでビルドとテストを実行
cargo build
cargo test
cargo clippy --all-targets --all-features -- -D warnings
```

---

## テストケース例

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bindable_invalid_placement() {
        // $bindable() を間違った場所で使った場合のテスト
        let source = r#"
            <script>
                let x = $bindable(); // エラー: $props() の外
            </script>
        "#;

        // パースして検証
        // エラーが返されることを確認
    }

    #[test]
    fn test_bindable_valid_placement() {
        let source = r#"
            <script>
                let { x = $bindable() } = $props();
            </script>
        "#;

        // パースして検証
        // エラーが返されないことを確認
    }

    // 他のテストケース...
}
```

---

## 参考ファイル

元の JavaScript 実装を参照してください：

- `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/CallExpression.js`
- `svelte/packages/svelte/src/compiler/phases/scope.js` (get_rune, get_global_keypath)
- `svelte/packages/svelte/src/compiler/nodes.js` (ExpressionMetadata)

---

## 完了チェックリスト

- [ ] TODO 1: JavaScript AST パス追跡
  - [ ] `js_path` フィールドを追加
  - [ ] `script.rs` で JS walker を実装
  - [ ] `get_parent()` を実装
  - [ ] テストを追加

- [ ] TODO 2: Expression メタデータ
  - [ ] `ExpressionMetadata` 構造体を定義
  - [ ] `expression_stack` を追加
  - [ ] `await_expression.rs` でメタデータを更新
  - [ ] `identifier.rs` で dependencies を追跡
  - [ ] `call_expression.rs` で has_call/has_state を設定
  - [ ] テストを追加

- [ ] TODO 3: Placement 検証
  - [ ] `is_bindable_valid_placement` を実装
  - [ ] `is_props_valid_placement` を実装
  - [ ] `is_props_id_valid_placement` を実装
  - [ ] `is_state_or_derived_valid_placement` を実装
  - [ ] `is_effect_valid_placement` を実装
  - [ ] `is_inspect_trace_valid_placement` を実装
  - [ ] `is_inside_generator_function` を実装
  - [ ] テストを追加

- [ ] すべてのテストが通る
- [ ] `cargo clippy` がクリーン
- [ ] ドキュメントを更新

---

## 優先順位

1. **高優先度:** TODO 3 (Placement 検証) - エラー検出の精度向上に直結
2. **中優先度:** TODO 1 (JS パス追跡) - Placement 検証の前提条件
3. **低優先度:** TODO 2 (Expression メタデータ) - async deriveds などの高度な機能

まずは TODO 1 → TODO 3 の順で実装することをお勧めします。
