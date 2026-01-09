# TODO Checklist

Phase 2 Analyze visitor の未完了タスク一覧

## 🔴 必須（High Priority）

### 1. Expression Metadata - await 検出
**ファイル**: `src/ast/js.rs`

```rust
// TODO: Expression に analyze_metadata() メソッドを追加
impl Expression {
    pub fn analyze_metadata(&self) -> ExpressionMetadata { /* ... */ }
}
```

**影響**:
- ✅ `animate_directive.rs:25` - await チェック
- ✅ `attach_tag.rs:27` - await チェック
- ✅ `bind_directive.rs` - await チェック
- ✅ `transition_directive.rs` - await チェック
- ✅ `use_directive.rs` - await チェック

**所要時間**: 2-3時間

---

### 2. AST Metadata Fields - 属性メタデータ
**ファイル**: `src/ast/template.rs`

```rust
// TODO: AttributeNode に metadata フィールドを追加
pub struct AttributeNode {
    // ...
    #[serde(skip, default)]
    pub metadata: RefCell<AttributeMetadata>,
}

pub struct AttributeMetadata {
    pub needs_clsx: bool,
    pub delegated: bool,
}
```

**影響**:
- ✅ `attribute.rs:67` - needs_clsx フラグ設定
- ✅ `attribute.rs:108` - delegated フラグ設定

**所要時間**: 1-2時間

---

## 🟡 重要（Medium Priority）

### 3. JavaScript AST Traversal
**ファイル**: `src/compiler/phases/2_analyze/visitors/js_visitor.rs` (新規)

```rust
// TODO: JS AST のトラバーサルを実装
pub fn visit_js_node(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    match node_type {
        "AssignmentExpression" => { /* ... */ }
        "Identifier" => { /* ... */ }
        // ...
    }
}
```

**影響**:
- ✅ `attribute.rs:21` - 式の子ノード訪問
- ✅ `assignment_expression.rs:53` - context.next() 実装

**所要時間**: 3-4時間

---

### 4. Reactive Statement Tracking
**ファイル**: `src/compiler/phases/2_analyze/visitors/assignment_expression.rs`

```rust
// TODO: VisitorContext に reactive_statement を追加
pub struct VisitorContext<'a> {
    // ...
    pub reactive_statement: Option<&'a mut ReactiveStatement>,
}
```

**影響**:
- ✅ `assignment_expression.rs:29-43` - reactive statement での代入追跡

**所要時間**: 2-3時間

---

## 🟢 拡張（Low Priority）

### 5. Expression Context Tracking
**ファイル**: `src/compiler/phases/2_analyze/visitors/mod.rs`

```rust
// TODO: VisitorContext に expression フィールドを追加
pub struct VisitorContext<'a> {
    // ...
    pub expression: Option<ExpressionContext>,
}
```

**影響**:
- ✅ `assignment_expression.rs:47` - expression.has_assignment 設定
- ✅ 完全な式分析

**所要時間**: 1-2時間

---

## 実装の進め方

### Phase 1: 基礎実装（1日目）
1. Expression Metadata (2-3h)
2. AST Metadata Fields (1-2h)

### Phase 2: トラバーサル（2日目）
3. JavaScript AST Traversal (3-4h)

### Phase 3: 高度な機能（3日目）
4. Reactive Statement Tracking (2-3h)
5. Expression Context Tracking (1-2h)

**合計見積もり**: 9-14時間

---

## 現在の状態

```
✅ AnimateDirective - 基本実装完了（await チェック待ち）
✅ ArrowFunctionExpression - 完全実装
✅ AssignmentExpression - 基本実装完了（reactive 追跡待ち）
✅ AttachTag - 基本実装完了（await チェック待ち）
✅ Attribute - 基本実装完了（metadata フィールド待ち）
```

---

## 検証方法

各実装後、以下をチェック：

```bash
# 1. ビルドが通るか
cargo build

# 2. 該当する visitor のテストがパスするか
cargo test animate_directive
cargo test attribute

# 3. フィクスチャテストがパスするか
cargo test test_parser_modern_fixtures -- --nocapture
```

---

## 優先順位の理由

1. **Expression Metadata**: 5つの visitor で await チェックが動作しないため最優先
2. **AST Metadata**: Phase 3 での使用に必要、比較的独立
3. **JS Traversal**: 完全な分析のために必要だが、段階的に実装可能
4. **Reactive Tracking**: 特定の機能（reactive statements）のみに影響
5. **Expression Context**: 最も影響範囲が小さい

---

## 参考リンク

- 詳細実装ガイド: [`TODO_IMPLEMENTATION_GUIDE.md`](./TODO_IMPLEMENTATION_GUIDE.md)
- Svelte 実装: `svelte/packages/svelte/src/compiler/phases/2-analyze/`
- テストフィクスチャ: `fixtures/*/samples/`
