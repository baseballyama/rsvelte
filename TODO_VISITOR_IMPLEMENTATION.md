# TODO: Phase 2 Visitor Implementation Guide

このドキュメントは、Component.js、ConstTag.js、DebugTag.js、EachBlock.js の Rust 移植で残された TODO の実装手順を示します。

## 優先度の定義

- 🔴 **Critical**: コンパイラの基本機能に必須（テスト合格に直接影響）
- 🟡 **High**: 重要な機能だが回避策がある
- 🟢 **Medium**: 最適化や完全性のため
- ⚪ **Low**: レガシーサポートや特殊ケース

---

## Phase 1: メタデータ構造の追加（🔴 Critical）

JavaScript コンパイラでは、各 AST ノードに `metadata` フィールドが存在し、分析情報を格納します。

### 1.1 Component のメタデータ拡張

**ファイル**: `src/ast/template.rs`

**現状**:
```rust
pub struct ComponentNodeMetadata {
    pub dynamic: bool,
}
```

**必要な拡張**:
```rust
pub struct ComponentNodeMetadata {
    /// Whether this is a dynamic component
    pub dynamic: bool,
    /// Path from root to this node (for error reporting)
    pub path: Vec<String>,
    /// Snippets that this component might render
    pub snippets: HashSet<usize>, // indices into snippet blocks
    /// Expression metadata for component name resolution
    pub expression: ExpressionMetadata,
}

#[derive(Debug, Clone, Default)]
pub struct ExpressionMetadata {
    /// Whether the expression contains state
    pub has_state: bool,
    /// Bindings that this expression depends on
    pub dependencies: HashSet<usize>, // binding indices
    /// Bindings that this expression references
    pub references: HashSet<usize>, // binding indices
}
```

**実装手順**:
1. `ExpressionMetadata` を `src/ast/template.rs` に追加
2. `ComponentNodeMetadata` を拡張
3. `Component::metadata` フィールドを初期化時に Default で設定
4. `src/compiler/phases/2_analyze/visitors/component.rs` の TODO を解決:
   ```rust
   // Before (component.rs:47-48)
   // TODO: Set node.metadata.dynamic = is_dynamic

   // After
   node.metadata.dynamic = is_dynamic;
   ```

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/Component.js:14-23`

---

### 1.2 EachBlock のメタデータ追加

**ファイル**: `src/ast/template.rs`

**必要な追加**:
```rust
/// Metadata for EachBlock nodes
#[derive(Debug, Clone, Default)]
pub struct EachBlockMetadata {
    /// Whether this is a keyed each block
    pub keyed: bool,
    /// Expression metadata for the iterable expression
    pub expression: ExpressionMetadata,
    /// Transitive dependencies (for legacy reactivity)
    pub transitive_deps: HashSet<usize>, // binding indices
}

pub struct EachBlock {
    // ... existing fields ...
    #[serde(skip)]
    pub metadata: EachBlockMetadata,
}
```

**実装手順**:
1. `EachBlockMetadata` を定義
2. `EachBlock` に `metadata` フィールドを追加
3. `src/compiler/phases/2_analyze/visitors/each_block.rs:56` の TODO を解決
4. `each_block.rs:60-64` のエラー処理を `errors::each_key_without_as()` に置き換え

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/EachBlock.js:28-29`

---

### 1.3 ConstTag と DebugTag のメタデータ追加

**ファイル**: `src/ast/template.rs`

**必要な追加**:
```rust
pub struct ConstTag {
    // ... existing fields ...
    #[serde(skip)]
    pub metadata: TagMetadata,
}

pub struct DebugTag {
    // ... existing fields ...
    #[serde(skip)]
    pub metadata: TagMetadata,
}

#[derive(Debug, Clone, Default)]
pub struct TagMetadata {
    /// Expression metadata
    pub expression: ExpressionMetadata,
}
```

**参照**:
- `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/ConstTag.js:37-44`
- `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/DebugTag.js:14`

---

## Phase 2: Expression Visitor の実装（🔴 Critical）

JavaScript AST ノード（Expression）を訪問し、識別子の参照を追跡します。

### 2.1 walk_js_expression の実装

**ファイル**: `src/compiler/phases/2_analyze/visitors/script.rs`

**新規関数**:
```rust
/// Visit a JavaScript expression and track identifier references
pub fn walk_js_expression(
    expression: &serde_json::Value,
    context: &mut VisitorContext,
    metadata: &mut ExpressionMetadata,
) -> Result<(), AnalysisError> {
    let expr_type = expression.get("type").and_then(|t| t.as_str());

    match expr_type {
        Some("Identifier") => {
            if let Some(name) = expression.get("name").and_then(|n| n.as_str()) {
                // Look up binding
                if let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name) {
                    let binding = &context.analysis.root.bindings[binding_idx];

                    // Add to references
                    metadata.references.insert(binding_idx);

                    // Check if it's state
                    if matches!(binding.kind, BindingKind::State | BindingKind::RawState | BindingKind::Derived) {
                        metadata.has_state = true;
                    }

                    // Add to dependencies
                    metadata.dependencies.insert(binding_idx);
                }
            }
        }
        Some("MemberExpression") => {
            // Recursively visit object and property
            if let Some(object) = expression.get("object") {
                walk_js_expression(object, context, metadata)?;
            }
            if let Some(property) = expression.get("property") {
                walk_js_expression(property, context, metadata)?;
            }
        }
        Some("CallExpression") => {
            // Visit callee and arguments
            if let Some(callee) = expression.get("callee") {
                walk_js_expression(callee, context, metadata)?;
            }
            if let Some(arguments) = expression.get("arguments").and_then(|a| a.as_array()) {
                for arg in arguments {
                    walk_js_expression(arg, context, metadata)?;
                }
            }
        }
        // Add more expression types as needed
        _ => {}
    }

    Ok(())
}
```

**使用箇所**:
- `component.rs:50-60` - コンポーネント名の解決
- `each_block.rs:64-75` - each 式の依存関係追跡
- `const_tag.rs:70-86` - const 宣言の初期化式
- `debug_tag.rs:28-33` - debug 識別子

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/shared/utils.js` の識別子追跡ロジック

---

## Phase 3: ConstTag の配置検証の修正（🔴 Critical）

### 3.1 Fragment チェックの問題

**現状の問題**: `const_tag.rs:27-34`

```rust
// Fragment is not a TemplateNode variant
let _parent = context.path.get(context.path.len() - 1);
```

`Fragment` は `TemplateNode` の variant ではなく、独立した構造体です。

**解決策 1: path の型を変更**

`VisitorContext.path` を `Vec<PathNode>` に変更:

```rust
pub enum PathNode {
    Template(&'a TemplateNode),
    Fragment(&'a Fragment),
}
```

**解決策 2: fragment_depth カウンタを追加**

```rust
pub struct VisitorContext<'a> {
    // ... existing fields ...
    /// Depth inside fragments (for const tag validation)
    pub fragment_depth: usize,
}
```

**推奨**: 解決策 2（シンプルで影響範囲が小さい）

**実装手順**:
1. `VisitorContext` に `fragment_depth` を追加
2. `fragment::analyze()` で `fragment_depth` をインクリメント/デクリメント
3. `const_tag.rs` で `context.fragment_depth > 0` をチェック

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/ConstTag.js:15-33`

---

## Phase 4: スロット処理の実装（🟡 High）

### 4.1 determine_slot の実装

**ファイル**: `src/compiler/phases/2_analyze/visitors/shared/slot.rs`（新規）

**新規関数**:
```rust
/// Determine which slot a node belongs to
pub fn determine_slot(node: &TemplateNode) -> Option<String> {
    let attributes = match node {
        TemplateNode::RegularElement(e) => Some(&e.attributes),
        TemplateNode::Component(c) => Some(&c.attributes),
        TemplateNode::SvelteFragment(f) => Some(&f.attributes),
        _ => None,
    }?;

    for attr in attributes {
        if let Attribute::Attribute(a) = attr {
            if a.name == "slot" {
                // Extract static value
                return extract_static_attribute_value(&a.value);
            }
        }
    }

    None
}

fn extract_static_attribute_value(value: &AttributeValue) -> Option<String> {
    match value {
        AttributeValue::Sequence(parts) => {
            let mut result = String::new();
            for part in parts {
                if let AttributeValuePart::Text(text) = part {
                    result.push_str(&text.data);
                } else {
                    return None; // Dynamic value
                }
            }
            Some(result)
        }
        AttributeValue::True(_) => Some(String::new()),
        AttributeValue::Expression(_) => None,
    }
}
```

### 4.2 スロット別のフラグメント訪問

**ファイル**: `src/compiler/phases/2_analyze/visitors/shared/component.rs:130-138`

**実装**:
```rust
// Analyze the component's children
// Group children by slot name
let mut slot_groups: HashMap<String, Vec<&TemplateNode>> = HashMap::new();
let mut comments: Vec<&TemplateNode> = Vec::new();

for child in &component.fragment.nodes {
    if matches!(child, TemplateNode::Comment(_)) {
        comments.push(child);
        continue;
    }

    let slot_name = determine_slot(child).unwrap_or_else(|| "default".to_string());
    slot_groups.entry(slot_name)
        .or_insert_with(Vec::new)
        .extend(&comments);
    slot_groups.get_mut(&slot_name)
        .unwrap()
        .push(child);

    if slot_name != "default" {
        comments.clear();
    }
}

// Visit each slot with appropriate scope
for (slot_name, nodes) in slot_groups {
    // TODO: Create slot-specific scope
    // let scope = node.metadata.scopes.get(&slot_name)?;

    for node in nodes {
        super::super::visit_node(node, context)?;
    }
}
```

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/shared/component.js:119-161`

---

## Phase 5: レガシーリアクティビティ（⚪ Low）

Svelte 4（非 runes モード）のための機能。runes を優先する場合はスキップ可能。

### 5.1 extract_identifiers の実装

**ファイル**: `src/compiler/phases/2_analyze/utils.rs`（新規）

```rust
/// Extract all identifier names from a pattern
pub fn extract_identifiers(pattern: &serde_json::Value) -> Vec<String> {
    let mut names = Vec::new();
    extract_identifiers_recursive(pattern, &mut names);
    names
}

fn extract_identifiers_recursive(pattern: &serde_json::Value, names: &mut Vec<String>) {
    match pattern.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => {
            if let Some(name) = pattern.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            }
        }
        Some("ArrayPattern") => {
            if let Some(elements) = pattern.get("elements").and_then(|e| e.as_array()) {
                for element in elements {
                    if !element.is_null() {
                        extract_identifiers_recursive(element, names);
                    }
                }
            }
        }
        Some("ObjectPattern") => {
            if let Some(properties) = pattern.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    if let Some(value) = property.get("value") {
                        extract_identifiers_recursive(value, names);
                    }
                }
            }
        }
        Some("AssignmentPattern") => {
            if let Some(left) = pattern.get("left") {
                extract_identifiers_recursive(left, names);
            }
        }
        Some("RestElement") => {
            if let Some(argument) = pattern.get("argument") {
                extract_identifiers_recursive(argument, names);
            }
        }
        _ => {}
    }
}
```

### 5.2 collect_transitive_dependencies の実装

**ファイル**: `src/compiler/phases/2_analyze/visitors/each_block.rs:135-158`

**前提条件**:
- `Binding` に `legacy_dependencies: Vec<usize>` フィールドを追加
- `Binding` に `mutated: bool` フィールドを追加

**実装**:
```rust
fn collect_transitive_dependencies(
    binding: &Binding,
    bindings: &mut HashSet<usize>,
    binding_idx: usize,
    all_bindings: &[Binding],
) {
    if bindings.contains(&binding_idx) {
        return;
    }
    bindings.insert(binding_idx);

    if binding.kind == BindingKind::LegacyReactive {
        for &dep_idx in &binding.legacy_dependencies {
            if dep_idx < all_bindings.len() {
                collect_transitive_dependencies(
                    &all_bindings[dep_idx],
                    bindings,
                    dep_idx,
                    all_bindings,
                );
            }
        }
    }
}
```

**使用箇所**: `each_block.rs:95-127`

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/EachBlock.js:47-73`

---

## Phase 6: エラーハンドリングの追加（🟢 Medium）

### 6.1 component_invalid_directive

**ファイル**: `src/compiler/phases/2_analyze/errors.rs`

```rust
/// Invalid directive on component
pub fn component_invalid_directive(directive_type: &str) -> AnalysisError {
    error(
        "component_invalid_directive",
        format!(
            "Components can only have `bind:`, `on:`, `let:`, `attach:` and `use:` directives, not `{}`",
            directive_type
        ),
    )
}
```

**使用箇所**: `shared/component.rs:123-125`

### 6.2 event_handler_invalid_component_modifier

```rust
/// Invalid event handler modifier on component
pub fn event_handler_invalid_component_modifier() -> AnalysisError {
    error(
        "event_handler_invalid_component_modifier",
        "Event handlers on components can only have the `once` modifier",
    )
}
```

**使用箇所**: `shared/component.rs:104-106`

### 6.3 disallow_unparenthesized_sequences

**ファイル**: `src/compiler/phases/2_analyze/validators.rs`（新規）

```rust
use super::AnalysisError;
use serde_json::Value;

/// Check if an expression is a sequence expression without parentheses
pub fn disallow_unparenthesized_sequences(
    expression: &Value,
    source: &str,
) -> Result<(), AnalysisError> {
    if expression.get("type").and_then(|t| t.as_str()) == Some("SequenceExpression") {
        if let Some(start) = expression.get("start").and_then(|s| s.as_u64()) {
            let mut i = start as usize;
            while i > 0 {
                i -= 1;
                let ch = source.chars().nth(i);
                match ch {
                    Some('(') => return Ok(()), // Parenthesized
                    Some('{') => {
                        return Err(super::errors::attribute_invalid_sequence_expression());
                    }
                    Some(c) if c.is_whitespace() => continue,
                    _ => break,
                }
            }
        }
    }
    Ok(())
}
```

**新規エラー**:
```rust
pub fn attribute_invalid_sequence_expression() -> AnalysisError {
    error(
        "attribute_invalid_sequence_expression",
        "Sequence expressions are not allowed in attributes. Wrap in parentheses: `(a, b)`",
    )
}
```

**使用箇所**:
- `shared/component.rs:84-89`
- `shared/component.rs:114-116`

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/shared/component.js:164-177`

---

## Phase 7: スニペットレンダラーの追跡（🟢 Medium）

### 7.1 snippet_renderers の追加

**ファイル**: `src/compiler/phases/2_analyze/types.rs`

```rust
pub struct ComponentAnalysis {
    // ... existing fields ...

    /// Map from component nodes to whether their snippet usage is resolved
    /// If true, we know exactly which snippets the component might render
    /// If false, it might render any locally-defined snippet
    pub snippet_renderers: HashMap<usize, bool>, // component node id -> resolved
}
```

### 7.2 実装

**ファイル**: `src/compiler/phases/2_analyze/visitors/shared/component.rs:70-71`

```rust
// Track snippet renderer resolution
let component_id = /* need to add unique ID to Component nodes */;
context.analysis.snippet_renderers.insert(component_id, resolved);
```

**前提条件**: 各 AST ノードに一意な ID を割り当てる仕組みが必要

**参照**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/shared/component.js:68`

---

## 実装の優先順序

### ステップ 1: 基本メタデータ（1-2 日）
1. ✅ ExpressionMetadata の定義
2. ✅ ComponentNodeMetadata の拡張
3. ✅ EachBlockMetadata の追加
4. ✅ TagMetadata の追加

### ステップ 2: Expression Visitor（2-3 日）
1. ✅ walk_js_expression の基本実装
2. ✅ Identifier 参照の追跡
3. ✅ MemberExpression、CallExpression のサポート
4. ✅ component.rs、each_block.rs での使用

### ステップ 3: ConstTag 配置検証（半日）
1. ✅ fragment_depth の追加
2. ✅ const_tag.rs の検証ロジック修正

### ステップ 4: スロット処理（1-2 日）
1. ✅ determine_slot の実装
2. ✅ スロット別グループ化
3. ✅ スロット専用スコープ（後で）

### ステップ 5: エラーハンドリング（1 日）
1. ✅ 新しいエラー関数の追加
2. ✅ disallow_unparenthesized_sequences
3. ✅ TODO コメントの置き換え

### ステップ 6: レガシーサポート（任意）
1. ⏸️ extract_identifiers
2. ⏸️ collect_transitive_dependencies
3. ⏸️ Binding の拡張

---

## テスト戦略

各フェーズ完了後にテストを実行：

```bash
# Parser tests (メタデータは影響しない)
cargo test test_parser_modern_fixtures

# Compiler tests (Phase 2 の変更を検証)
cargo test --test compiler_fixtures

# CSS tests (スロット処理の影響を確認)
cargo test --test css

# Runtime tests (全体的な動作確認)
cargo test --test runtime
```

---

## デバッグのヒント

### メタデータの確認
```rust
#[cfg(test)]
fn debug_metadata(component: &Component) {
    eprintln!("Component metadata:");
    eprintln!("  dynamic: {}", component.metadata.dynamic);
    eprintln!("  dependencies: {:?}", component.metadata.expression.dependencies);
}
```

### Expression visitor のトレース
```rust
pub fn walk_js_expression(...) -> Result<(), AnalysisError> {
    eprintln!("Visiting expression: {:?}", expression.get("type"));
    // ... implementation
}
```

### JavaScript との比較
```bash
# JavaScript コンパイラの出力を生成
cd svelte
node scripts/parse-with-svelte.mjs path/to/component.svelte

# Rust コンパイラの出力と比較
cd ..
cargo run -- compile path/to/component.svelte
```

---

## 参考リソース

### JavaScript コード
- `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/`
- `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/shared/`

### Rust コード
- `src/compiler/phases/2_analyze/visitors/`
- `src/ast/template.rs` - AST 定義
- `src/compiler/phases/2_analyze/scope.rs` - スコープとバインディング

### ドキュメント
- [Svelte Compiler Handbook](https://github.com/sveltejs/svelte/blob/main/documentation/docs/05-misc/04-v5-migration-guide.md)
- [TODO_IMPLEMENTATION_GUIDE.md](./TODO_IMPLEMENTATION_GUIDE.md) - Phase 2 全体のガイド

---

## 完了チェックリスト

Phase 2 Visitor の実装が完了したら、以下を確認：

- [ ] すべての TODO コメントが解決済み
- [ ] cargo build が警告なしで通る
- [ ] cargo test で関連テストが通る
- [ ] cargo clippy が警告を出さない
- [ ] 新しいエラーが適切な箇所で使用されている
- [ ] メタデータが正しく初期化・更新されている
- [ ] ドキュメントコメントが追加されている

---

最終更新: 2026-01-10
