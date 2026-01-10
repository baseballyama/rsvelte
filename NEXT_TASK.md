# 次の作業指示書

## 📋 現在の状況（2026-01-10）

### ✅ 完了した実装

1. **IfBlock metadata サポート**
   - `ExpressionMetadata`にasync関連フィールド追加（`has_await`, `has_call`, `is_async()`など）
   - `IfBlockMetadata`を定義し、`IfBlock`にmetadataフィールド追加
   - Phase 2でtest expression分析の基盤構築
   - Phase 3でmetadataを使用してasync式を正しく処理

2. **Visitor統合（ComponentContext）**
   - `visit_if_block()`メソッド実装 → `if_block::if_block()`を呼び出し
   - `visit_regular_element()`メソッド実装 → `regular_element::visit_regular_element()`を呼び出し
   - モジュールexport設定（`if_block`, `regular_element`, `utils`）
   - コンパイル成功

3. **コミット**
   - `feat: Implement IfBlock metadata support for async expression handling`
   - `feat: Wire IfBlock and RegularElement visitors to ComponentContext`

### ⏸️ 保留中の問題

- **Fragment visitor**: 型互換性の問題で一旦無効化
  - `JsExpressionStatement` vs `JsStatement`の型不一致
  - `build_render_statement()`の引数型が異なる
  - 現在のアーキテクチャとの整合性が必要

### 📊 テスト状況

- **runtime-runes**: 7/724パス（1.0%）← 前回測定時
- **実行中**: 最新のテスト結果を確認中

---

## 🎯 次のタスク（優先順位順）

### タスク1: テスト結果確認と進捗測定 ⭐⭐⭐⭐⭐

**目的**: IfBlock/RegularElement統合の効果を測定

**実行手順**:
```bash
# 1. 実行中のテスト結果を確認
cat /tmp/claude/-Users-baseballyama-git-svelte-compiler-rust/tasks/bcd7e7a.output

# 2. または新規にテスト実行
cargo test --test runtime test_runtime_runes -- --nocapture 2>&1 | tee test_results.txt

# 3. パス数を確認
grep "Total:" test_results.txt
```

**成功基準**:
- テスト結果が取得できる
- パス数が7/724から変化したか確認

**所要時間**: 10-15分（テスト実行時間含む）

---

### タスク2: Fragment visitor の修正 ⭐⭐⭐⭐⭐

**目的**: Fragment visitorを有効化してテンプレート処理を実装

**問題点**:
1. `JsExpressionStatement` vs `JsStatement`の型不一致
2. `build_render_statement()`のシグネチャ不一致
3. `state.let_directives`の型が`Vec<JsExpressionStatement>`

**実行手順**:

#### Step 2.1: 型定義を確認
```bash
# JsStatementとJsExpressionStatementの定義を確認
grep -A 10 "pub enum JsStatement" src/compiler/phases/3_transform/js_ast/nodes.rs
grep -A 10 "pub struct JsExpressionStatement" src/compiler/phases/3_transform/js_ast/nodes.rs
```

#### Step 2.2: 型変換関数を追加
`src/compiler/phases/3_transform/client/visitors/fragment.rs`に以下を追加:

```rust
// JsExpressionStatement → JsStatement変換
fn to_statement(expr_stmt: JsExpressionStatement) -> JsStatement {
    JsStatement::Expression(expr_stmt)
}
```

#### Step 2.3: fragment.rsの修正
```rust
// 273行目付近を修正
body.extend(state.let_directives.into_iter().map(to_statement));
body.extend(state.consts);

// 298行目付近を修正
if !state.update.is_empty() {
    let render_stmt = build_render_statement(state.update);
    body.push(JsStatement::Expression(render_stmt));
}
```

#### Step 2.4: build_render_statementのシグネチャ確認
```bash
grep -A 5 "pub fn build_render_statement" src/compiler/phases/3_transform/client/visitors/shared/utils.rs
```

#### Step 2.5: fragment visitorを有効化
```bash
# mod.rsでコメント解除
sed -i '' 's|// pub mod fragment;|pub mod fragment;|' src/compiler/phases/3_transform/client/visitors/mod.rs
```

#### Step 2.6: コンパイル確認
```bash
cargo build --lib 2>&1 | grep "error\[E"
```

**成功基準**:
- `cargo build --lib`が成功
- fragment visitorがモジュールとしてexportされている

**所要時間**: 1-2時間

---

### タスク3: 最小限のFragmentサポート実装 ⭐⭐⭐⭐

**目的**: 単一Textノードのケースのみサポートして段階的に進める

**実行手順**:

#### Step 3.1: fragment.rsを簡略化
現在の`fragment.rs`の複雑な分岐を削除し、最もシンプルなケースのみ実装:

```rust
pub fn fragment(node: &Fragment, context: &mut ComponentContext) -> JsBlockStatement {
    // 単一Textノードのケースのみ実装
    if node.nodes.len() == 1 {
        if let TemplateNode::Text(text) = &node.nodes[0] {
            let id_name = "text_0"; // 固定ID
            let id = b::id(id_name);

            let init = b::var_decl(
                id_name,
                Some(b::call(b::member_path("$.text"), vec![b::string(&text.data)])),
            );

            let append = b::stmt(b::call(
                b::member_path("$.append"),
                vec![b::id("$$anchor"), id],
            ));

            return JsBlockStatement {
                body: vec![init, append]
            };
        }
    }

    // それ以外は空ブロック
    JsBlockStatement { body: Vec::new() }
}
```

#### Step 3.2: テスト実行
```bash
cargo test --test runtime test_runtime_runes -- --nocapture 2>&1 | grep "Total:"
```

**成功基準**:
- コンパイル成功
- 少なくとも1つのテストが新たにパス

**所要時間**: 30分-1時間

---

### タスク4: ExpressionTag visitor 実装 ⭐⭐⭐

**目的**: `{expression}`タグのサポートを追加

**参照**:
- `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js` (91-92行)
- `process_children()`内でTextとExpressionTagをsequenceとして処理

**実行手順**:

#### Step 4.1: ExpressionTag visitorスケルトン作成
```rust
// src/compiler/phases/3_transform/client/visitors/expression_tag.rs
pub fn visit_expression_tag(
    node: &ExpressionTag,
    context: &mut ComponentContext,
) -> TransformResult {
    // TODO: Implement {expression} transformation
    TransformResult::None
}
```

#### Step 4.2: ComponentContextに統合
```rust
// src/compiler/phases/3_transform/client/types.rs
fn visit_expression_tag(&mut self, expr: &crate::ast::template::ExpressionTag) -> TransformResult {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_tag::visit_expression_tag;
    visit_expression_tag(expr, self)
}
```

#### Step 4.3: 公式実装を参照して実装
```bash
# JavaScript実装を確認
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js | sed -n '74,88p'
```

**成功基準**:
- コンパイル成功
- ExpressionTagを含むテストが1つ以上パス

**所要時間**: 1-2時間

---

### タスク5: process_children() ヘルパー実装 ⭐⭐⭐⭐

**目的**: 複数の子ノード（Text + ExpressionTag）を正しく処理

**参照**:
- `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js`

**実行手順**:

#### Step 5.1: shared/fragment.rsモジュール作成
```bash
touch src/compiler/phases/3_transform/client/visitors/shared/fragment.rs
```

#### Step 5.2: process_children関数のスケルトン
```rust
pub fn process_children(
    nodes: &[TemplateNode],
    initial: impl Fn(bool) -> JsExpr,
    is_element: bool,
    context: &mut ComponentContext,
) {
    // Text/ExpressionTagのsequence処理
    // その他のノードはcontext.visit_node()で処理
}
```

#### Step 5.3: 段階的実装
1. Textノードのみ処理
2. ExpressionTag追加
3. その他のノード追加

**成功基準**:
- 複数Textノードを含むテストがパス
- Text + ExpressionTagの混在テストがパス

**所要時間**: 2-3時間

---

## 📝 推奨実行順序

### 最優先（今すぐ実行）:
1. **タスク1**: テスト結果確認 → 現状把握

### 次に実行:
2. **タスク3**: 最小限のFragment実装 → 早期成果
3. **タスク1**: テスト再実行 → 進捗確認

### その後:
4. **タスク2**: Fragment visitor修正 → 本格実装
5. **タスク4**: ExpressionTag実装
6. **タスク5**: process_children実装

---

## 🎯 目標

### 短期目標（次の2-3時間）:
- runtime-runesテスト: 7/724 → **20/724** (2.8%)
- 単一Textノードのケースをサポート

### 中期目標（次の1日）:
- runtime-runesテスト: 20/724 → **100/724** (13.8%)
- Fragment, ExpressionTag, process_children実装完了

### 長期目標（次の1週間）:
- runtime-runesテスト: 100/724 → **360/724** (50%)
- RegularElement完全実装、各種ディレクティブサポート

---

## 📚 参考リソース

- **公式実装**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/`
- **実装ガイド**: `PHASE3_CLIENT_GUIDE.md`
- **現在のコミット**: `7bdfcea` (Wire IfBlock and RegularElement visitors)

---

## ⚠️ 注意事項

1. **段階的実装**: 大きなvisitorは一度に実装せず、最小限のケースから始める
2. **テスト駆動**: 各実装後に必ずテストを実行して進捗を確認
3. **コミット頻度**: 動作する変更は小さくても即座にコミット
4. **型エラー**: 型不一致が発生したら、既存の動作しているコードを参照

---

このドキュメントは実装の進捗に応じて更新してください。
