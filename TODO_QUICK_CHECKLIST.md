# TODO Quick Checklist

Component.js、ConstTag.js、DebugTag.js、EachBlock.js の移植で残された TODO の簡潔なチェックリスト。

詳細は [TODO_VISITOR_IMPLEMENTATION.md](./TODO_VISITOR_IMPLEMENTATION.md) を参照。

---

## 🔴 Critical（必須実装）

### ✅ Phase 1: メタデータ構造の追加

#### 1.1 ExpressionMetadata の追加
```rust
// src/ast/template.rs
#[derive(Debug, Clone, Default)]
pub struct ExpressionMetadata {
    pub has_state: bool,
    pub dependencies: HashSet<usize>,
    pub references: HashSet<usize>,
}
```

#### 1.2 Component メタデータの拡張
```rust
// src/ast/template.rs
pub struct ComponentNodeMetadata {
    pub dynamic: bool,
    pub path: Vec<String>,
    pub snippets: HashSet<usize>,
    pub expression: ExpressionMetadata,
}
```

#### 1.3 EachBlock メタデータの追加
```rust
// src/ast/template.rs
#[derive(Debug, Clone, Default)]
pub struct EachBlockMetadata {
    pub keyed: bool,
    pub expression: ExpressionMetadata,
    pub transitive_deps: HashSet<usize>,
}

pub struct EachBlock {
    // ... existing fields ...
    #[serde(skip)]
    pub metadata: EachBlockMetadata,
}
```

#### 1.4 Tag メタデータの追加
```rust
// src/ast/template.rs
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
    pub expression: ExpressionMetadata,
}
```

**影響するファイル**:
- `src/compiler/phases/2_analyze/visitors/component.rs:47-60`
- `src/compiler/phases/2_analyze/visitors/each_block.rs:56-64`
- `src/compiler/phases/2_analyze/visitors/const_tag.rs:70-86`
- `src/compiler/phases/2_analyze/visitors/debug_tag.rs:28-33`

**テスト**: `cargo build && cargo test --test compiler_fixtures`

---

### ✅ Phase 2: Expression Visitor

#### 2.1 walk_js_expression 関数の実装
```rust
// src/compiler/phases/2_analyze/visitors/script.rs
pub fn walk_js_expression(
    expression: &serde_json::Value,
    context: &mut VisitorContext,
    metadata: &mut ExpressionMetadata,
) -> Result<(), AnalysisError> {
    match expression.get("type").and_then(|t| t.as_str()) {
        Some("Identifier") => { /* track references */ }
        Some("MemberExpression") => { /* visit object & property */ }
        Some("CallExpression") => { /* visit callee & args */ }
        _ => {}
    }
    Ok(())
}
```

**使用箇所**:
- `component.rs:50-60` - コンポーネント名解決
- `each_block.rs:64-75` - each 式の依存関係
- `const_tag.rs:70-86` - const 初期化式
- `debug_tag.rs:28-33` - debug 識別子

**テスト**: `cargo test test_runtime_runes`

---

### ✅ Phase 3: ConstTag 配置検証の修正

#### 3.1 fragment_depth の追加
```rust
// src/compiler/phases/2_analyze/visitors/mod.rs
pub struct VisitorContext<'a> {
    // ... existing fields ...
    pub fragment_depth: usize,
}
```

#### 3.2 fragment::analyze でカウンタ更新
```rust
// src/compiler/phases/2_analyze/visitors/shared/fragment.rs
pub fn analyze(fragment: &Fragment, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    context.fragment_depth += 1;
    for node in &fragment.nodes {
        super::super::visit_node(node, context)?;
    }
    context.fragment_depth -= 1;
    Ok(())
}
```

#### 3.3 const_tag.rs の検証修正
```rust
// src/compiler/phases/2_analyze/visitors/const_tag.rs:26-34
if context.fragment_depth == 0 {
    return Err(super::super::errors::const_tag_invalid_placement());
}

// Check grand parent type from context.path
if context.path.len() < 1 {
    return Err(super::super::errors::const_tag_invalid_placement());
}
```

**テスト**: `cargo test --test validator`

---

## 🟡 High（重要機能）

### ✅ Phase 4: スロット処理

#### 4.1 determine_slot 関数の実装
```rust
// src/compiler/phases/2_analyze/visitors/shared/slot.rs (新規)
pub fn determine_slot(node: &TemplateNode) -> Option<String> {
    // Extract slot attribute value
}
```

#### 4.2 スロット別グループ化
```rust
// src/compiler/phases/2_analyze/visitors/shared/component.rs:130-138
let mut slot_groups: HashMap<String, Vec<&TemplateNode>> = HashMap::new();
for child in &component.fragment.nodes {
    let slot_name = determine_slot(child).unwrap_or_else(|| "default".to_string());
    slot_groups.entry(slot_name).or_insert_with(Vec::new).push(child);
}
```

**テスト**: `cargo test --test css` (slot 関連テスト)

---

## 🟢 Medium（最適化）

### ✅ Phase 5: エラーハンドリングの追加

#### 5.1 新しいエラー関数
```rust
// src/compiler/phases/2_analyze/errors.rs
pub fn component_invalid_directive(directive_type: &str) -> AnalysisError { ... }
pub fn event_handler_invalid_component_modifier() -> AnalysisError { ... }
pub fn attribute_invalid_sequence_expression() -> AnalysisError { ... }
```

#### 5.2 disallow_unparenthesized_sequences
```rust
// src/compiler/phases/2_analyze/validators.rs (新規)
pub fn disallow_unparenthesized_sequences(
    expression: &Value,
    source: &str,
) -> Result<(), AnalysisError> { ... }
```

**使用箇所**:
- `shared/component.rs:104-106` - イベントハンドラ修飾子
- `shared/component.rs:123-125` - 無効なディレクティブ
- `shared/component.rs:84-89, 114-116` - シーケンス式

**テスト**: `cargo test --test compiler_errors`

---

### ✅ Phase 6: スニペットレンダラーの追跡

#### 6.1 snippet_renderers フィールド追加
```rust
// src/compiler/phases/2_analyze/types.rs
pub struct ComponentAnalysis {
    // ... existing fields ...
    pub snippet_renderers: HashMap<usize, bool>,
}
```

#### 6.2 使用箇所の実装
```rust
// src/compiler/phases/2_analyze/visitors/shared/component.rs:70-71
context.analysis.snippet_renderers.insert(component_id, resolved);
```

**前提条件**: AST ノードに一意な ID が必要

---

## ⚪ Low（レガシーサポート）

### ✅ Phase 7: レガシーリアクティビティ（Svelte 4）

#### 7.1 Binding の拡張
```rust
// src/compiler/phases/2_analyze/scope.rs
pub struct Binding {
    // ... existing fields ...
    pub mutated: bool,
    pub legacy_dependencies: Vec<usize>,
}
```

#### 7.2 extract_identifiers
```rust
// src/compiler/phases/2_analyze/utils.rs (新規)
pub fn extract_identifiers(pattern: &serde_json::Value) -> Vec<String> { ... }
```

#### 7.3 collect_transitive_dependencies
```rust
// src/compiler/phases/2_analyze/visitors/each_block.rs:135-158
fn collect_transitive_dependencies(...) { ... }
```

**使用箇所**: `each_block.rs:95-127` (非 runes モードのみ)

**テスト**: `cargo test test_runtime_legacy` (Svelte 4 互換性)

---

## 実装順序

```
Day 1-2:  Phase 1 (メタデータ構造) ← 最優先
Day 3-5:  Phase 2 (Expression Visitor)
Day 6:    Phase 3 (ConstTag 検証)
Day 7-8:  Phase 4 (スロット処理)
Day 9:    Phase 5 (エラーハンドリング)
Day 10:   Phase 6 (スニペット追跡) [任意]
Day 11+:  Phase 7 (レガシー) [スキップ可能]
```

---

## 各フェーズ完了後のテスト

```bash
# Phase 1 完了後
cargo build && cargo test --test compiler_fixtures

# Phase 2 完了後
cargo test test_runtime_runes -- --nocapture

# Phase 3 完了後
cargo test --test validator -- --nocapture

# Phase 4 完了後
cargo test --test css -- --nocapture

# Phase 5 完了後
cargo test --test compiler_errors -- --nocapture

# 全体テスト
cargo test && npm run compatibility-report
```

---

## クイックデバッグコマンド

```bash
# 特定のコンポーネントをコンパイル
cargo run -- compile test.svelte --output test.js

# JavaScript コンパイラと比較
cd svelte && node scripts/parse-with-svelte.mjs ../test.svelte

# 詳細ログ付きテスト
RUST_LOG=debug cargo test test_name -- --nocapture

# フォーマットとリント
cargo fmt && cargo clippy --all-targets
```

---

## 完了確認

各フェーズ完了時に確認：

```bash
# ビルドが通る
cargo build

# 警告がない
cargo clippy --all-targets -- -D warnings

# フォーマットが正しい
cargo fmt -- --check

# 関連テストが通る
cargo test [test_name]
```

最終確認：
```bash
# すべてのテストが通る
cargo test

# 互換性レポートの更新
npm run compatibility-report

# 進捗を確認
git diff --stat
```

---

## トラブルシューティング

### メタデータが None エラー
→ Default trait を実装し、初期化時に設定

### walk_js_expression でパニック
→ expression.get() の前に is_null() チェック

### fragment_depth が正しくない
→ fragment::analyze の前後でインクリメント/デクリメント

### テストが通らない
→ JavaScript 出力と比較: `node scripts/compare-parsers.mjs`

---

詳細な実装手順は [TODO_VISITOR_IMPLEMENTATION.md](./TODO_VISITOR_IMPLEMENTATION.md) を参照してください。
