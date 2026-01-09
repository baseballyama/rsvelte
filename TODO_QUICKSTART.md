# TODO Implementation - Quick Start Guide

最短で TODO を解決するための実践ガイド

## 🚀 すぐに始める

### 必要な知識
- Rust の基本（所有権、借用、パターンマッチング）
- JSON/AST の基本概念
- Svelte コンパイラの基本構造（Phase 1/2/3）

### 開発環境
```bash
# ビルド＆テスト
cargo build
cargo test

# 特定のテストのみ実行
cargo test animate_directive -- --nocapture

# フォーマット＆Lint
cargo fmt
cargo clippy --all-targets --all-features
```

---

## ⚡ 最優先タスク: Expression Metadata

### 実装時間: 2-3時間

### Step 1: 型定義 (15分)

**ファイル**: `src/ast/js.rs`（既存ファイルの末尾に追加）

```rust
/// Metadata extracted from analyzing a JavaScript expression.
#[derive(Debug, Clone, Default)]
pub struct ExpressionMetadata {
    /// Whether the expression contains an await expression.
    pub has_await: bool,

    /// Whether the expression contains an assignment.
    pub has_assignment: bool,

    /// Identifiers referenced in the expression.
    pub references: std::collections::HashSet<String>,
}
```

### Step 2: 基本実装 (45分)

**同じファイル** (`src/ast/js.rs`) に追加:

```rust
impl Expression {
    /// Analyze the expression to extract metadata.
    pub fn analyze_metadata(&self) -> ExpressionMetadata {
        let mut metadata = ExpressionMetadata::default();
        analyze_node(self.as_json(), &mut metadata);
        metadata
    }
}

/// Recursively analyze an expression node.
fn analyze_node(node: &serde_json::Value, metadata: &mut ExpressionMetadata) {
    let node_type = node.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match node_type {
        // 最優先: await 検出
        "AwaitExpression" => {
            metadata.has_await = true;
            if let Some(arg) = node.get("argument") {
                analyze_node(arg, metadata);
            }
        }

        // 代入検出
        "AssignmentExpression" | "UpdateExpression" => {
            metadata.has_assignment = true;
            visit_children(node, metadata);
        }

        // 識別子収集
        "Identifier" => {
            if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
                metadata.references.insert(name.to_string());
            }
        }

        // メンバー式
        "MemberExpression" => {
            if let Some(obj) = node.get("object") {
                analyze_node(obj, metadata);
            }
            if let Some(prop) = node.get("property") {
                if node.get("computed").and_then(|c| c.as_bool()).unwrap_or(false) {
                    analyze_node(prop, metadata);
                }
            }
        }

        // 二項演算子
        "BinaryExpression" | "LogicalExpression" => {
            if let Some(left) = node.get("left") {
                analyze_node(left, metadata);
            }
            if let Some(right) = node.get("right") {
                analyze_node(right, metadata);
            }
        }

        // 配列
        "ArrayExpression" => {
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for elem in elements {
                    if !elem.is_null() {
                        analyze_node(elem, metadata);
                    }
                }
            }
        }

        // オブジェクト
        "ObjectExpression" => {
            if let Some(props) = node.get("properties").and_then(|p| p.as_array()) {
                for prop in props {
                    if let Some(value) = prop.get("value") {
                        analyze_node(value, metadata);
                    }
                }
            }
        }

        // 関数（body を解析）
        "ArrowFunctionExpression" | "FunctionExpression" => {
            if let Some(body) = node.get("body") {
                analyze_node(body, metadata);
            }
        }

        // 単項演算子
        "UnaryExpression" => {
            if let Some(arg) = node.get("argument") {
                analyze_node(arg, metadata);
            }
        }

        // 三項演算子
        "ConditionalExpression" => {
            if let Some(test) = node.get("test") {
                analyze_node(test, metadata);
            }
            if let Some(cons) = node.get("consequent") {
                analyze_node(cons, metadata);
            }
            if let Some(alt) = node.get("alternate") {
                analyze_node(alt, metadata);
            }
        }

        // 呼び出し式
        "CallExpression" => {
            if let Some(callee) = node.get("callee") {
                analyze_node(callee, metadata);
            }
            if let Some(args) = node.get("arguments").and_then(|a| a.as_array()) {
                for arg in args {
                    analyze_node(arg, metadata);
                }
            }
        }

        // リテラル（何もしない）
        "Literal" | "ThisExpression" | "Super" => {}

        // 未知のノード型は共通の子を試す
        _ => visit_children(node, metadata),
    }
}

/// Visit common child properties.
fn visit_children(node: &serde_json::Value, metadata: &mut ExpressionMetadata) {
    if let Some(left) = node.get("left") {
        analyze_node(left, metadata);
    }
    if let Some(right) = node.get("right") {
        analyze_node(right, metadata);
    }
    if let Some(arg) = node.get("argument") {
        analyze_node(arg, metadata);
    }
}
```

### Step 3: Visitor での使用 (30分)

**ファイル**: `src/compiler/phases/2_analyze/visitors/animate_directive.rs`

```rust
// 既存の TODO コメントを削除して、以下に置き換え:

pub fn visit(
    directive: &AnimateDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check for await expressions
    if let Some(expr) = &directive.expression {
        let metadata = expr.analyze_metadata();
        if metadata.has_await {
            return Err(crate::compiler::phases::phase2_analyze::errors::illegal_await_expression());
        }
    }

    // Validate keyed each block
    let in_keyed_each = context.path.iter().rev().any(|node| {
        if let crate::ast::template::TemplateNode::EachBlock(each) = node {
            each.key.is_some()
        } else {
            false
        }
    });

    if !in_keyed_each {
        return Err(AnalysisError::Validation(
            "animate directive can only be used on an element that is the immediate child of a keyed {#each} block".to_string(),
        ));
    }

    Ok(())
}
```

**同様に更新**:
- `attach_tag.rs` (27行目付近)
- `bind_directive.rs`
- `transition_directive.rs`
- `use_directive.rs`

### Step 4: テスト (30分)

**新規ファイル**: `tests/expression_metadata.rs`

```rust
#[cfg(test)]
mod tests {
    use svelte_compiler_rust::ast::js::Expression;
    use serde_json::json;

    #[test]
    fn test_await_detection() {
        let expr = Expression::from_json(json!({
            "type": "AwaitExpression",
            "argument": {
                "type": "CallExpression",
                "callee": {"type": "Identifier", "name": "fetch"}
            }
        }));

        let metadata = expr.analyze_metadata();
        assert!(metadata.has_await, "Should detect await expression");
    }

    #[test]
    fn test_nested_await() {
        let expr = Expression::from_json(json!({
            "type": "BinaryExpression",
            "left": {
                "type": "AwaitExpression",
                "argument": {"type": "Identifier", "name": "x"}
            },
            "right": {"type": "Literal", "value": 5}
        }));

        let metadata = expr.analyze_metadata();
        assert!(metadata.has_await, "Should detect nested await");
    }

    #[test]
    fn test_assignment_detection() {
        let expr = Expression::from_json(json!({
            "type": "AssignmentExpression",
            "left": {"type": "Identifier", "name": "x"},
            "right": {"type": "Literal", "value": 42}
        }));

        let metadata = expr.analyze_metadata();
        assert!(metadata.has_assignment);
    }
}
```

```bash
# テスト実行
cargo test expression_metadata
```

---

## 🎯 次のタスク: AST Metadata Fields

### 実装時間: 1-2時間

### Step 1: 型定義 (15分)

**ファイル**: `src/ast/template.rs`（AttributeNode の定義を探す）

```rust
// 既存の AttributeNode struct の前に追加:

/// Metadata for attributes, populated during analysis phase.
#[derive(Debug, Clone, Default)]
pub struct AttributeMetadata {
    /// Whether this class attribute needs clsx() for resolution.
    pub needs_clsx: bool,

    /// Whether this event attribute can be delegated.
    pub delegated: bool,
}

// 既存の AttributeNode に metadata フィールドを追加:
#[derive(Debug, Clone, Deserialize)]
pub struct AttributeNode {
    pub start: u32,
    pub end: u32,
    pub name: CompactString,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_loc: Option<SourceLocation>,
    pub value: AttributeValue,

    /// Metadata populated during analysis (not serialized).
    #[serde(skip, default)]
    pub metadata: std::cell::RefCell<AttributeMetadata>,
}
```

### Step 2: Visitor での使用 (30分)

**ファイル**: `src/compiler/phases/2_analyze/visitors/attribute.rs`

```rust
// 67行目付近の TODO を削除して置き換え:
if !matches!(expr_type, "Literal" | "TemplateLiteral" | "BinaryExpression") {
    mark_subtree_dynamic(&context.path);

    // Set metadata flag
    attribute.metadata.borrow_mut().needs_clsx = true;
}

// 108行目付近の TODO を削除して置き換え:
if let Some(TemplateNode::RegularElement(_)) = parent {
    let event_name = &attribute.name[2..];
    let delegated = can_delegate_event(event_name);

    // Set metadata flag
    attribute.metadata.borrow_mut().delegated = delegated;
}
```

### Step 3: テスト (15分)

```bash
# 既存のテストを実行して確認
cargo test attribute

# ビルドが通ることを確認
cargo build
```

---

## 📋 進捗チェックリスト

実装が完了したら、以下をチェック：

```
□ Expression Metadata
  □ src/ast/js.rs に型定義を追加
  □ analyze_metadata() メソッドを実装
  □ animate_directive.rs を更新
  □ attach_tag.rs を更新
  □ テストが通る

□ AST Metadata Fields
  □ src/ast/template.rs に AttributeMetadata を追加
  □ AttributeNode に metadata フィールドを追加
  □ attribute.rs で needs_clsx を設定
  □ attribute.rs で delegated を設定
  □ ビルドが通る

□ 全体確認
  □ cargo build が成功
  □ cargo test が成功
  □ cargo clippy でエラーなし
  □ TODO コメントを削除または更新
```

---

## 🆘 トラブルシューティング

### ビルドエラー: "cannot find type `ExpressionMetadata`"

```rust
// src/ast/js.rs の先頭に use を追加
use std::collections::HashSet;
```

### テストエラー: "module not found"

```bash
# tests/ ディレクトリにいることを確認
ls tests/

# もしくは tests/common/mod.rs に追加
```

### Clippy 警告: "field is never read"

```rust
// metadata フィールドに #[allow(dead_code)] を追加（一時的）
#[allow(dead_code)]
pub metadata: RefCell<AttributeMetadata>,
```

---

## 📚 参考資料

### Svelte の実装を見る

```bash
# animate_directive.rs の元となる JS コード
cat svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/AnimateDirective.js

# 式の分析ロジック（参考用）
cat svelte/packages/svelte/src/compiler/utils/ast.js
```

### Rust AST の構造を確認

```bash
# AST 定義を確認
rg "pub struct Expression" src/ast/

# 使用例を確認
rg "analyze_metadata" src/
```

---

## ✅ 完了後

1. **コミット**: 機能ごとに分けてコミット
   ```bash
   git add src/ast/js.rs
   git commit -m "feat: implement Expression metadata analysis"

   git add src/compiler/phases/2_analyze/visitors/*.rs
   git commit -m "fix: resolve TODOs for await expression checks"
   ```

2. **テスト実行**: すべてのテストを実行
   ```bash
   cargo test --all
   ```

3. **次のタスク**: TODO_CHECKLIST.md の次の項目へ

---

## 💡 ヒント

- **小さく始める**: まず `has_await` だけを実装し、動作確認してから拡張
- **既存コードを参考に**: 似たような処理をしている既存のコードを探す
- **テスト駆動**: 実装前に失敗するテストを書いてから実装
- **段階的にコミット**: 動作する状態で頻繁にコミット

**質問があれば TODO_IMPLEMENTATION_GUIDE.md を参照してください！**
