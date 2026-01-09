# TODO Implementation Guide

このドキュメントは、Phase 2 Analyze の visitor 実装で残された TODO を解決するための詳細な指示書です。

## 概要

以下の5つの主要な TODO が残っています：

1. **Expression Metadata Tracking** - 式の分析メタデータ（await, assignment の検出）
2. **AST Metadata Fields** - AST ノードへのメタデータフィールド追加
3. **Reactive Statement Tracking** - リアクティブステートメントでの代入追跡
4. **JavaScript AST Traversal** - JavaScript 式のトラバーサル実装
5. **Context State Management** - VisitorContext の状態管理拡張

---

## 1. Expression Metadata Tracking

### 目的
JavaScript 式を解析して、`has_await` や `has_assignment` などのメタデータを抽出する。

### 影響を受けるファイル
- `src/compiler/phases/2_analyze/visitors/animate_directive.rs`
- `src/compiler/phases/2_analyze/visitors/attach_tag.rs`
- `src/compiler/phases/2_analyze/visitors/bind_directive.rs`
- `src/compiler/phases/2_analyze/visitors/transition_directive.rs`
- `src/compiler/phases/2_analyze/visitors/use_directive.rs`

### 実装手順

#### Step 1.1: ExpressionMetadata 型の定義

`src/ast/js.rs` に以下を追加：

```rust
/// Metadata extracted from analyzing a JavaScript expression.
#[derive(Debug, Clone, Default)]
pub struct ExpressionMetadata {
    /// Whether the expression contains an await expression.
    pub has_await: bool,

    /// Whether the expression contains an assignment.
    pub has_assignment: bool,

    /// Whether the expression contains a call expression.
    pub has_call: bool,

    /// Identifiers referenced in the expression.
    pub references: std::collections::HashSet<String>,
}

impl Expression {
    /// Analyze the expression to extract metadata.
    pub fn analyze_metadata(&self) -> ExpressionMetadata {
        let mut metadata = ExpressionMetadata::default();

        // Recursively walk the expression AST
        analyze_expression_node(self.as_json(), &mut metadata);

        metadata
    }
}

/// Recursively analyze an expression node.
fn analyze_expression_node(node: &serde_json::Value, metadata: &mut ExpressionMetadata) {
    let node_type = node.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match node_type {
        "AwaitExpression" => {
            metadata.has_await = true;
            if let Some(argument) = node.get("argument") {
                analyze_expression_node(argument, metadata);
            }
        }
        "AssignmentExpression" | "UpdateExpression" => {
            metadata.has_assignment = true;
            // Analyze left and right
            if let Some(left) = node.get("left") {
                analyze_expression_node(left, metadata);
            }
            if let Some(right) = node.get("right") {
                analyze_expression_node(right, metadata);
            }
        }
        "CallExpression" => {
            metadata.has_call = true;
            if let Some(callee) = node.get("callee") {
                analyze_expression_node(callee, metadata);
            }
            if let Some(args) = node.get("arguments").and_then(|a| a.as_array()) {
                for arg in args {
                    analyze_expression_node(arg, metadata);
                }
            }
        }
        "Identifier" => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                metadata.references.insert(name.to_string());
            }
        }
        "MemberExpression" => {
            if let Some(object) = node.get("object") {
                analyze_expression_node(object, metadata);
            }
            if let Some(property) = node.get("property") {
                if node.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
                    analyze_expression_node(property, metadata);
                }
            }
        }
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = node.get("left") {
                analyze_expression_node(left, metadata);
            }
            if let Some(right) = node.get("right") {
                analyze_expression_node(right, metadata);
            }
        }
        "ConditionalExpression" => {
            if let Some(test) = node.get("test") {
                analyze_expression_node(test, metadata);
            }
            if let Some(consequent) = node.get("consequent") {
                analyze_expression_node(consequent, metadata);
            }
            if let Some(alternate) = node.get("alternate") {
                analyze_expression_node(alternate, metadata);
            }
        }
        "ArrayExpression" => {
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        analyze_expression_node(element, metadata);
                    }
                }
            }
        }
        "ObjectExpression" => {
            if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        analyze_expression_node(value, metadata);
                    }
                    if let Some(key) = property.get("key") {
                        if property.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
                            analyze_expression_node(key, metadata);
                        }
                    }
                }
            }
        }
        "ArrowFunctionExpression" | "FunctionExpression" => {
            // Analyze body
            if let Some(body) = node.get("body") {
                analyze_expression_node(body, metadata);
            }
        }
        "SequenceExpression" => {
            if let Some(expressions) = node.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    analyze_expression_node(expr, metadata);
                }
            }
        }
        "UnaryExpression" => {
            if let Some(argument) = node.get("argument") {
                analyze_expression_node(argument, metadata);
            }
        }
        "SpreadElement" => {
            if let Some(argument) = node.get("argument") {
                analyze_expression_node(argument, metadata);
            }
        }
        "TemplateLiteral" => {
            if let Some(expressions) = node.get("expressions").and_then(|e| e.as_array()) {
                for expr in expressions {
                    analyze_expression_node(expr, metadata);
                }
            }
        }
        "TaggedTemplateExpression" => {
            if let Some(tag) = node.get("tag") {
                analyze_expression_node(tag, metadata);
            }
            if let Some(quasi) = node.get("quasi") {
                analyze_expression_node(quasi, metadata);
            }
        }
        "NewExpression" => {
            if let Some(callee) = node.get("callee") {
                analyze_expression_node(callee, metadata);
            }
            if let Some(args) = node.get("arguments").and_then(|a| a.as_array()) {
                for arg in args {
                    analyze_expression_node(arg, metadata);
                }
            }
        }
        "ThisExpression" | "Super" | "Literal" => {
            // These don't need recursion
        }
        _ => {
            // For unknown types, try to recurse into common properties
            if let Some(body) = node.get("body") {
                analyze_expression_node(body, metadata);
            }
        }
    }
}
```

#### Step 1.2: ExpressionTag への metadata フィールド追加

`src/ast/template.rs` の `ExpressionTag` に metadata フィールドを追加：

```rust
#[derive(Debug, Clone, Deserialize)]
pub struct ExpressionTag {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,

    /// Metadata extracted from expression analysis.
    /// This is populated during parsing or analysis phase.
    #[serde(skip, default)]
    pub metadata: std::cell::RefCell<Option<crate::ast::js::ExpressionMetadata>>,
}

impl ExpressionTag {
    /// Get or compute the expression metadata.
    pub fn get_metadata(&self) -> crate::ast::js::ExpressionMetadata {
        let mut metadata_ref = self.metadata.borrow_mut();
        if metadata_ref.is_none() {
            *metadata_ref = Some(self.expression.analyze_metadata());
        }
        metadata_ref.as_ref().unwrap().clone()
    }
}
```

#### Step 1.3: Visitor での使用

`src/compiler/phases/2_analyze/visitors/animate_directive.rs` を更新：

```rust
pub fn visit(
    directive: &AnimateDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check for await expressions in the directive expression
    if let Some(expr) = &directive.expression {
        let metadata = expr.analyze_metadata();
        if metadata.has_await {
            return Err(crate::compiler::phases::phase2_analyze::errors::illegal_await_expression());
        }
    }

    // ... rest of the validation
}
```

同様に、以下のファイルも更新：
- `attach_tag.rs`
- `bind_directive.rs`
- `transition_directive.rs`
- `use_directive.rs`

### テスト

`tests/expression_metadata.rs` を作成：

```rust
#[cfg(test)]
mod tests {
    use crate::ast::js::Expression;
    use serde_json::json;

    #[test]
    fn test_has_await() {
        let expr = Expression::from_json(json!({
            "type": "AwaitExpression",
            "argument": {
                "type": "CallExpression",
                "callee": {"type": "Identifier", "name": "fetch"}
            }
        }));

        let metadata = expr.analyze_metadata();
        assert!(metadata.has_await);
        assert!(metadata.has_call);
    }

    #[test]
    fn test_has_assignment() {
        let expr = Expression::from_json(json!({
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {"type": "Identifier", "name": "x"},
            "right": {"type": "Literal", "value": 5}
        }));

        let metadata = expr.analyze_metadata();
        assert!(metadata.has_assignment);
        assert!(metadata.references.contains("x"));
    }
}
```

---

## 2. AST Metadata Fields

### 目的
AST ノードにメタデータフィールドを追加して、分析情報を保存する。

### 影響を受けるファイル
- `src/ast/template.rs`
- `src/compiler/phases/2_analyze/visitors/attribute.rs`

### 実装手順

#### Step 2.1: AttributeMetadata 型の定義

`src/ast/template.rs` に追加：

```rust
/// Metadata for attributes, populated during analysis phase.
#[derive(Debug, Clone, Default)]
pub struct AttributeMetadata {
    /// Whether this class attribute needs clsx() for resolution.
    pub needs_clsx: bool,

    /// Whether this event attribute can be delegated.
    pub delegated: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AttributeNode {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue,

    /// Metadata populated during analysis.
    #[serde(skip, default)]
    pub metadata: std::cell::RefCell<AttributeMetadata>,
}

impl AttributeNode {
    /// Get mutable access to metadata.
    pub fn metadata_mut(&self) -> std::cell::RefMut<AttributeMetadata> {
        self.metadata.borrow_mut()
    }
}
```

#### Step 2.2: Attribute visitor での使用

`src/compiler/phases/2_analyze/visitors/attribute.rs` を更新：

```rust
// class 属性の clsx フラグ設定
if attribute.name == "class" {
    use crate::ast::template::AttributeValue;

    if let AttributeValue::Expression(expr_tag) = &attribute.value {
        let expr_type = expr_tag.expression.node_type().unwrap_or("");

        if !matches!(
            expr_type,
            "Literal" | "TemplateLiteral" | "BinaryExpression"
        ) {
            mark_subtree_dynamic(&context.path);

            // Set metadata flag
            attribute.metadata_mut().needs_clsx = true;
        }
    }
}

// Event 属性の委譲フラグ設定
if is_event_attribute(attribute) {
    if let Some(TemplateNode::RegularElement(_)) = parent {
        let event_name = &attribute.name[2..]; // Remove "on" prefix
        let delegated = can_delegate_event(event_name);

        // Set metadata flag
        attribute.metadata_mut().delegated = delegated;
    }
}
```

#### Step 2.3: Phase 3 での metadata 使用

`src/compiler/phases/3_transform/client/visitors/shared/element.rs` などで metadata を参照：

```rust
// Transform attributes
for attr in &element.attributes {
    if let Attribute::Attribute(attribute) = attr {
        let metadata = attribute.metadata.borrow();

        if attribute.name == "class" && metadata.needs_clsx {
            // Generate clsx() call
            code.push_str(&format!("clsx({})", expr));
        }

        if is_event_attribute(attribute) && metadata.delegated {
            // Use delegated event handling
            code.push_str("/* delegated event */");
        }
    }
}
```

---

## 3. Reactive Statement Tracking

### 目的
リアクティブステートメント (`$: x = y`) での代入を追跡する。

### 影響を受けるファイル
- `src/compiler/phases/2_analyze/visitors/mod.rs`
- `src/compiler/phases/2_analyze/visitors/assignment_expression.rs`

### 実装手順

#### Step 3.1: ReactiveStatement 型の定義

`src/compiler/phases/2_analyze/types.rs` に追加：

```rust
/// Information about a reactive statement ($: ...).
#[derive(Debug, Clone)]
pub struct ReactiveStatement {
    /// The statement node.
    pub node: serde_json::Value,

    /// Bindings that are assigned to in this statement.
    pub assignments: std::collections::HashSet<usize>, // Binding indices

    /// Bindings that are referenced in this statement.
    pub references: std::collections::HashSet<usize>, // Binding indices
}

impl ReactiveStatement {
    pub fn new(node: serde_json::Value) -> Self {
        Self {
            node,
            assignments: std::collections::HashSet::new(),
            references: std::collections::HashSet::new(),
        }
    }
}
```

#### Step 3.2: VisitorContext への追加

`src/compiler/phases/2_analyze/visitors/mod.rs` を更新：

```rust
pub struct VisitorContext<'a> {
    // ... existing fields ...

    /// Current reactive statement being analyzed (if any).
    pub reactive_statement: Option<&'a mut ReactiveStatement>,
}
```

#### Step 3.3: AssignmentExpression での追跡

`src/compiler/phases/2_analyze/visitors/assignment_expression.rs` を更新：

```rust
pub fn visit(
    node: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Validate assignment
    if let Some(left) = node.get("left") {
        validate_assignment(left, context, false)?;
    }

    // Track assignments in reactive statements
    if let Some(reactive_stmt) = &mut context.reactive_statement {
        if let Some(left) = node.get("left") {
            // Extract identifiers from left-hand side
            let identifiers = extract_identifiers_from_pattern(left);

            for identifier in identifiers {
                if let Some(name) = identifier.get("name").and_then(|n| n.as_str()) {
                    // Look up binding
                    if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name) {
                        reactive_stmt.assignments.insert(binding_idx);
                    }
                }
            }
        }
    }

    Ok(())
}

/// Extract identifiers from a pattern (for destructuring).
fn extract_identifiers_from_pattern(pattern: &Value) -> Vec<&Value> {
    let mut identifiers = Vec::new();
    extract_identifiers_recursive(pattern, &mut identifiers);
    identifiers
}

fn extract_identifiers_recursive<'a>(pattern: &'a Value, identifiers: &mut Vec<&'a Value>) {
    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            identifiers.push(pattern);
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        extract_identifiers_recursive(element, identifiers);
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if property.get("type").and_then(|t| t.as_str()) == Some("Property") {
                        if let Some(value) = property.get("value") {
                            extract_identifiers_recursive(value, identifiers);
                        }
                    } else if property.get("type").and_then(|t| t.as_str()) == Some("RestElement") {
                        if let Some(argument) = property.get("argument") {
                            extract_identifiers_recursive(argument, identifiers);
                        }
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                extract_identifiers_recursive(left, identifiers);
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                extract_identifiers_recursive(argument, identifiers);
            }
        }
        Some("MemberExpression") => {
            // MemberExpressions can be on the left side of assignment
            // e.g., obj.prop = value
            identifiers.push(pattern);
        }
        _ => {}
    }
}
```

---

## 4. JavaScript AST Traversal

### 目的
JavaScript 式の子ノードを訪問して、完全な分析を行う。

### 実装手順

#### Step 4.1: JS Visitor の作成

`src/compiler/phases/2_analyze/visitors/js_visitor.rs` を作成：

```rust
//! JavaScript AST visitor for Phase 2 analysis.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::AnalysisError;
use serde_json::Value;

/// Visit a JavaScript AST node.
pub fn visit_js_node(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    let node_type = node.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match node_type {
        "AssignmentExpression" => {
            super::assignment_expression::visit(node, context)?;
        }
        "ArrowFunctionExpression" => {
            super::arrow_function_expression::visit(context)?;
        }
        "CallExpression" => {
            visit_call_expression(node, context)?;
        }
        "Identifier" => {
            visit_identifier(node, context)?;
        }
        "MemberExpression" => {
            visit_member_expression(node, context)?;
        }
        "BinaryExpression" | "LogicalExpression" => {
            visit_binary_expression(node, context)?;
        }
        "UnaryExpression" | "UpdateExpression" => {
            visit_unary_expression(node, context)?;
        }
        "ConditionalExpression" => {
            visit_conditional_expression(node, context)?;
        }
        "ArrayExpression" => {
            visit_array_expression(node, context)?;
        }
        "ObjectExpression" => {
            visit_object_expression(node, context)?;
        }
        // ... add more node types as needed
        _ => {
            // For unknown types, try to visit children
            visit_children(node, context)?;
        }
    }

    Ok(())
}

fn visit_children(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Common child properties
    if let Some(left) = node.get("left") {
        visit_js_node(left, context)?;
    }
    if let Some(right) = node.get("right") {
        visit_js_node(right, context)?;
    }
    if let Some(argument) = node.get("argument") {
        visit_js_node(argument, context)?;
    }
    if let Some(object) = node.get("object") {
        visit_js_node(object, context)?;
    }
    if let Some(property) = node.get("property") {
        visit_js_node(property, context)?;
    }
    if let Some(callee) = node.get("callee") {
        visit_js_node(callee, context)?;
    }
    if let Some(args) = node.get("arguments").and_then(|a| a.as_array()) {
        for arg in args {
            visit_js_node(arg, context)?;
        }
    }

    Ok(())
}

// Implement specific visitors for each node type
fn visit_call_expression(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Visit callee
    if let Some(callee) = node.get("callee") {
        visit_js_node(callee, context)?;
    }

    // Visit arguments
    if let Some(args) = node.get("arguments").and_then(|a| a.as_array()) {
        for arg in args {
            visit_js_node(arg, context)?;
        }
    }

    Ok(())
}

// ... implement other visit functions
```

#### Step 4.2: Attribute visitor での使用

`src/compiler/phases/2_analyze/visitors/attribute.rs` を更新：

```rust
pub fn visit(
    attribute: &AttributeNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Visit expressions in attribute value
    use crate::ast::template::AttributeValue;

    match &attribute.value {
        AttributeValue::Expression(expr_tag) => {
            // Visit the expression
            super::js_visitor::visit_js_node(expr_tag.expression.as_json(), context)?;
        }
        AttributeValue::Sequence(parts) => {
            for part in parts {
                if let crate::ast::template::AttributeValuePart::ExpressionTag(expr_tag) = part {
                    super::js_visitor::visit_js_node(expr_tag.expression.as_json(), context)?;
                }
            }
        }
        _ => {}
    }

    // ... rest of the validation
}
```

---

## 5. Context State Management

### 目的
VisitorContext に式や reactive statement の状態を追加する。

### 実装手順

#### Step 5.1: ExpressionContext の定義

`src/compiler/phases/2_analyze/types.rs` に追加：

```rust
/// Context for analyzing an expression.
#[derive(Debug, Clone)]
pub struct ExpressionContext {
    /// Bindings referenced in this expression.
    pub references: std::collections::HashSet<usize>,

    /// Whether this expression contains an assignment.
    pub has_assignment: bool,

    /// Whether this expression contains a call.
    pub has_call: bool,
}

impl ExpressionContext {
    pub fn new() -> Self {
        Self {
            references: std::collections::HashSet::new(),
            has_assignment: false,
            has_call: false,
        }
    }
}
```

#### Step 5.2: VisitorContext の拡張

`src/compiler/phases/2_analyze/visitors/mod.rs` を更新：

```rust
pub struct VisitorContext<'a> {
    // ... existing fields ...

    /// Current expression context (if analyzing an expression).
    pub expression: Option<ExpressionContext>,

    /// Current reactive statement (if analyzing a reactive statement).
    pub reactive_statement: Option<&'a mut ReactiveStatement>,
}

impl<'a> VisitorContext<'a> {
    /// Enter an expression context.
    pub fn enter_expression(&mut self) -> ExpressionContext {
        let context = ExpressionContext::new();
        self.expression = Some(context.clone());
        context
    }

    /// Exit an expression context and return the final context.
    pub fn exit_expression(&mut self) -> Option<ExpressionContext> {
        self.expression.take()
    }
}
```

#### Step 5.3: AssignmentExpression での使用

`src/compiler/phases/2_analyze/visitors/assignment_expression.rs` を更新：

```rust
pub fn visit(
    node: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // ... validation ...

    // Mark expression as having assignment
    if let Some(ref mut expr_ctx) = context.expression {
        expr_ctx.has_assignment = true;
    }

    // Visit children
    super::js_visitor::visit_children(node, context)?;

    Ok(())
}
```

---

## 実装順序の推奨

1. **Expression Metadata Tracking** (最優先)
   - これにより await 式のチェックが機能する
   - 他の機能への依存が少ない

2. **AST Metadata Fields**
   - Expression Metadata の後に実装
   - Phase 3 での使用準備

3. **JavaScript AST Traversal**
   - Expression と AST metadata の後に実装
   - 完全な分析のために必要

4. **Context State Management**
   - JS Traversal と並行して実装可能

5. **Reactive Statement Tracking**
   - 最後に実装（他の機能に依存）

---

## テスト戦略

各実装後、以下をテスト：

1. **Unit tests**: 個別の関数をテスト
2. **Integration tests**: Phase 2 全体の動作確認
3. **Fixture tests**: Svelte の公式テストとの互換性確認

```bash
# Unit tests
cargo test --lib expression_metadata

# Integration tests
cargo test --test compiler_fixtures

# すべてのテスト
cargo test
```

---

## 完了基準

各 TODO が解決されたことを確認：

- [ ] `has_await` チェックが動作（AnimateDirective, AttachTag, など）
- [ ] `needs_clsx` フラグが正しく設定される
- [ ] `delegated` フラグが正しく設定される
- [ ] Reactive statement での代入追跡が動作
- [ ] JavaScript 式の完全なトラバーサルが動作
- [ ] すべてのテストがパス

---

## 質問・サポート

実装中に不明点があれば、以下を確認：

1. **Svelte の JavaScript 実装**: `svelte/packages/svelte/src/compiler/phases/2-analyze/`
2. **既存の Rust 実装**: 類似の visitor を参照
3. **テストケース**: `svelte/packages/svelte/tests/` のフィクスチャ

エラーが発生した場合は、以下の情報を含めて報告：
- エラーメッセージ
- 再現手順
- 期待される動作
