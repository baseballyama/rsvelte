# 次のタスク：Phase 3 Transform ビルドエラー修正指示書

## 📋 目的

Phase 3 Transform の第1バッチ実装で発生した **30個のコンパイルエラー**を完全に修正し、`cargo build` が成功する状態にする。

## 🎯 ゴール

- ✅ `cargo build` が警告のみで成功すること
- ✅ 全てのコンパイルエラー（30個）が解消されていること
- ✅ 警告も可能な限り修正すること

## 📊 現在の状況

```
ビルドエラー: 30個
警告: 37個
ビルド状態: ❌ 失敗
```

## 🔧 修正タスク（優先順位順）

### タスク 1: `ScopeRoot::generate_unique_name()` メソッドの実装 ⚠️ **最優先**

**影響:** 3箇所のエラー

**ファイル:** `src/compiler/phases/2_analyze/scope.rs`

**手順:**

1. `ScopeRoot` 構造体に `generate_unique_name()` メソッドを追加

```rust
// src/compiler/phases/2_analyze/scope.rs

impl ScopeRoot {
    // 既存のメソッド...

    /// Generate a unique name based on the given base name.
    ///
    /// Ensures the name doesn't conflict with existing bindings
    /// by appending a counter if necessary.
    ///
    /// # Arguments
    ///
    /// * `base` - The base name to use
    ///
    /// # Returns
    ///
    /// A unique name that doesn't conflict with any existing bindings
    ///
    /// # Examples
    ///
    /// ```
    /// let scope_root = ScopeRoot::new();
    /// let name = scope_root.generate_unique_name("button".to_string());
    /// // Returns "button" if no conflict, "button_1" if "button" exists, etc.
    /// ```
    pub fn generate_unique_name(&self, base: String) -> String {
        let mut name = base.clone();
        let mut counter = 1;

        // Check if the name conflicts with any existing binding
        while self.bindings.iter().any(|b| b.name == name) {
            name = format!("{}_{}", base, counter);
            counter += 1;
        }

        name
    }
}
```

2. テストを追加（推奨）

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_unique_name_no_conflict() {
        let scope_root = ScopeRoot::new();
        let name = scope_root.generate_unique_name("button".to_string());
        assert_eq!(name, "button");
    }

    #[test]
    fn test_generate_unique_name_with_conflict() {
        let mut scope_root = ScopeRoot::new();

        // Add a binding named "button"
        scope_root.bindings.push(Binding {
            name: "button".to_string(),
            kind: BindingKind::Normal,
            initial: None,
            mutated: false,
            referenced: false,
            referenced_from_script: false,
            reassigned: false,
            scope: 0,
            is_called: false,
            is_param: false,
            prop_alias: None,
            legacy_dependencies: Vec::new(),
            metadata: None,
        });

        let name = scope_root.generate_unique_name("button".to_string());
        assert_eq!(name, "button_1");
    }
}
```

3. ビルドして確認

```bash
cargo build 2>&1 | grep "generate_unique_name"
```

エラーが0件になることを確認。

---

### タスク 2: `TemplateBuilder` 構造の修正 ⚠️ **高優先度**

**影響:** 6箇所のエラー

**ファイル:** `src/compiler/phases/3_transform/client/transform_template/types.rs`

**手順:**

1. まず JavaScript 版の Template 構造を確認

```bash
# JavaScript 版を読む
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/types.d.ts | grep -A 30 "interface Template"
```

2. `TemplateBuilder` に不足しているフィールドを追加

```rust
// src/compiler/phases/3_transform/client/transform_template/types.rs

#[derive(Debug, Clone)]
pub struct TemplateBuilder {
    // 既存のフィールド...

    /// Whether this template needs to import the node runtime function
    /// Used to track if $.node() should be imported
    pub needs_import_node: bool,

    /// Generated template nodes (for debugging/inspection)
    /// Stores the actual template structure being built
    pub nodes: Vec<crate::ast::template::TemplateNode>,

    /// Component metadata (scoping, namespace, etc.)
    /// Contains information about CSS scoping and namespace
    pub metadata: ComponentMetadata,
}

/// Component metadata for templates
#[derive(Debug, Clone)]
pub struct ComponentMetadata {
    /// Whether the template uses scoped CSS
    pub scoped: bool,

    /// The namespace for the template (HTML, SVG, MathML)
    pub namespace: Namespace,
}

/// Template namespace
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Namespace {
    Html,
    Svg,
    MathML,
}

impl Default for Namespace {
    fn default() -> Self {
        Namespace::Html
    }
}
```

3. `TemplateBuilder::new()` を更新

```rust
impl TemplateBuilder {
    pub fn new() -> Self {
        Self {
            // 既存のフィールド...
            needs_import_node: false,
            nodes: Vec::new(),
            metadata: ComponentMetadata {
                scoped: false,
                namespace: Namespace::Html,
            },
        }
    }
}
```

4. visitor で使用している箇所を確認・修正

```bash
# metadata を使用している箇所を探す
rg "\.metadata\." src/compiler/phases/3_transform/client/visitors/
```

各箇所で `state.template.metadata` へのアクセスが正しく動作することを確認。

5. ビルドして確認

```bash
cargo build 2>&1 | grep "needs_import_node\|\.nodes\|\.metadata"
```

---

### タスク 3: `RegularElement::metadata` フィールドの追加

**影響:** 2箇所のエラー

**ファイル:** `src/ast/template.rs`

**手順:**

1. JavaScript 版の定義を確認

```bash
cat svelte/packages/svelte/src/compiler/phases/2-analyze/types.d.ts | grep -A 20 "interface RegularElement"
```

2. `ElementMetadata` 構造体を追加

```rust
// src/ast/template.rs

/// Metadata added to elements by phase 2 analysis
#[derive(Debug, Clone, Default)]
pub struct ElementMetadata {
    /// Whether this element uses scoped CSS
    pub scoped: bool,

    /// Whether this is a dynamic element
    pub dynamic: bool,

    /// SVG namespace information
    pub svg: bool,

    /// MathML namespace information
    pub mathml: bool,
}
```

3. `RegularElement` に `metadata` フィールドを追加

```rust
// src/ast/template.rs

#[derive(Debug, Clone)]
pub struct RegularElement {
    pub name: CompactString,
    pub attributes: Vec<Attribute>,
    pub fragment: Fragment,

    // 既存のフィールド...

    /// Element metadata (added by phase 2 analysis)
    pub metadata: Option<ElementMetadata>,
}
```

4. Parser でデフォルト値を設定

```rust
// src/compiler/phases/1_parse/state/element.rs

// RegularElement を作成する箇所で metadata を初期化
RegularElement {
    name: element_name,
    attributes,
    fragment,
    // ...
    metadata: None,  // Phase 1 では None、Phase 2 で設定
}
```

5. Phase 2 で metadata を設定する準備（TODO コメント）

```rust
// src/compiler/phases/2_analyze/visitors/regular_element.rs (将来実装)

// TODO: Phase 2 で metadata を設定
// element.metadata = Some(ElementMetadata {
//     scoped: context.state.metadata.scoped,
//     dynamic: false,
//     svg: context.state.namespace == Namespace::Svg,
//     mathml: context.state.namespace == Namespace::MathML,
// });
```

6. ビルドして確認

```bash
cargo build 2>&1 | grep "metadata"
```

---

### タスク 4: 型の不一致の修正（8箇所）

**影響:** 8箇所のエラー

**手順:**

#### 4-1. CompactString → String の変換

```bash
# エラー箇所を特定
cargo build 2>&1 | grep "CompactString" -A 3 -B 3
```

**修正例:**

```rust
// ❌ 誤り
let s: String = compact_string.into();

// ✅ 正しい
let s: String = compact_string.to_string();
```

#### 4-2. Template vs TemplateBuilder

```bash
# エラー箇所を特定
cargo build 2>&1 | grep "Template::new()" -A 3 -B 3
```

**修正例:**

```rust
// ❌ 誤り
template: Template::new(),

// ✅ 正しい
template: TemplateBuilder::new(),
```

全ての `Template::new()` を `TemplateBuilder::new()` に置換：

```bash
# 一括置換（確認してから実行）
rg "Template::new\(\)" src/compiler/phases/3_transform/client/visitors/ -l | \
  xargs sed -i '' 's/Template::new()/TemplateBuilder::new()/g'
```

#### 4-3. Vec<JsExpressionStatement> vs Vec<JsStatement>

```bash
# エラー箇所を特定
cargo build 2>&1 | grep "JsExpressionStatement" -A 3 -B 3
```

**修正例:**

```rust
// ❌ 誤り
let statements: Vec<JsStatement> = expr_statements;

// ✅ 正しい
let statements: Vec<JsStatement> = expr_statements
    .into_iter()
    .map(|e| JsStatement::Expression(e))
    .collect();
```

#### 4-4. その他の型エラー

各エラーメッセージを読み、適切に型を変換。

```bash
# 全ての型エラーをリスト
cargo build 2>&1 | grep "error\[E0308\]" -A 5 > /tmp/type_errors.txt
cat /tmp/type_errors.txt
```

---

### タスク 5: 関数引数の不一致の修正（3箇所）

**影響:** 3箇所のエラー

**手順:**

1. エラー箇所を特定

```bash
cargo build 2>&1 | grep "error\[E0061\]" -A 5 -B 2
```

2. 各エラーについて関数定義を確認

```bash
# 例: transform_template の定義を確認
rg "fn transform_template" src/compiler/phases/3_transform/client/transform_template/
```

3. 呼び出し箇所を修正

**例:**

```rust
// エラーメッセージ:
// this function takes 4 arguments but 3 arguments were supplied

// 関数定義を確認:
fn transform_template(
    state: &mut ComponentClientTransformState,
    namespace: Namespace,
    flags: Option<u32>,
    anchor: Option<JsExpr>
) -> JsExpr

// 呼び出し箇所を修正:
// ❌ 誤り（3引数）
transform_template(state, namespace, flags)

// ✅ 正しい（4引数）
transform_template(state, namespace, flags, None)
```

4. 全ての関数引数エラーを修正後、ビルド確認

```bash
cargo build 2>&1 | grep "error\[E0061\]"
```

---

### タスク 6: その他のエラーの修正（8箇所）

**影響:** 8箇所のエラー

**手順:**

1. 残りのエラーをリスト化

```bash
cargo build 2>&1 | grep "^error\[" > /tmp/remaining_errors.txt
cat /tmp/remaining_errors.txt
```

2. 各エラーを個別に修正

#### 6-1. `JsBlockStatement` の `span` フィールド（既に修正済み）

✅ 既に修正済み

#### 6-2. 値の移動後の借用エラー（E0382）

```bash
cargo build 2>&1 | grep "error\[E0382\]" -A 10 -B 2
```

**典型的な修正:**

```rust
// ❌ 誤り
let x = value;
use(value);  // エラー: value は移動済み

// ✅ 正しい（参照を使用）
let x = &value;
use(&value);

// または ✅ 正しい（クローン）
let x = value.clone();
use(value);
```

#### 6-3. トレイト境界エラー（E0277）

```bash
cargo build 2>&1 | grep "error\[E0277\]" -A 10 -B 2
```

適切な型変換を追加。

#### 6-4. その他

各エラーメッセージを読み、Rust コンパイラの提案に従って修正。

---

### タスク 7: 警告の修正（37箇所）

**影響:** コード品質の向上

**手順:**

1. 未使用変数の警告を修正

```bash
cargo build 2>&1 | grep "unused variable" -A 2 > /tmp/unused_vars.txt
cat /tmp/unused_vars.txt
```

**修正方法:**

```rust
// オプション A: アンダースコアプレフィックス
fn function(_unused_param: Type) { }

// オプション B: 削除（使わない場合）

// オプション C: #[allow(unused)] 属性（TODO実装の場合）
#[allow(unused)]
fn placeholder_function(param: Type) {
    todo!("Implement later")
}
```

2. 未使用インポートの削除

```bash
cargo build 2>&1 | grep "unused import" -A 2
```

該当する `use` 文を削除。

3. 到達不可能パターンの修正

```bash
cargo build 2>&1 | grep "unreachable pattern" -A 5 -B 5
```

パターンマッチを修正。

4. すべての警告を修正

```bash
cargo build 2>&1 | grep "^warning"
```

---

## 📝 作業手順

### ステップ 1: 環境確認

```bash
# 現在のブランチを確認
git branch

# 作業用ブランチを作成（推奨）
git checkout -b fix/phase3-build-errors

# 現在のエラー数を記録
cargo build 2>&1 | grep "^error" | wc -l > /tmp/initial_errors.txt
```

### ステップ 2: タスク 1-3 を実行（構造的な修正）

```bash
# タスク 1: ScopeRoot::generate_unique_name() 実装
# → src/compiler/phases/2_analyze/scope.rs を編集

# タスク 2: TemplateBuilder 構造修正
# → src/compiler/phases/3_transform/client/transform_template/types.rs を編集

# タスク 3: RegularElement::metadata 追加
# → src/ast/template.rs を編集

# ビルド確認
cargo build 2>&1 | tee /tmp/after_structural_fixes.txt
```

### ステップ 3: タスク 4-5 を実行（型とシグネチャの修正）

```bash
# タスク 4: 型の不一致を修正
# → 各 visitor ファイルを編集

# タスク 5: 関数引数の不一致を修正
# → 各 visitor ファイルを編集

# ビルド確認
cargo build 2>&1 | tee /tmp/after_type_fixes.txt
```

### ステップ 4: タスク 6 を実行（残りのエラー修正）

```bash
# 残りのエラーを1つずつ修正

# ビルド確認
cargo build 2>&1 | tee /tmp/after_all_fixes.txt
```

### ステップ 5: タスク 7 を実行（警告の修正）

```bash
# 警告を修正

# 最終ビルド
cargo build 2>&1 | tee /tmp/final_build.txt
```

### ステップ 6: テストの実行

```bash
# ビルドが成功したら、テストを実行
cargo test --test validator 2>&1 | tee /tmp/validator_test_results.txt

# 結果を分析
grep "test result:" /tmp/validator_test_results.txt
```

### ステップ 7: コミットとプッシュ

```bash
# フォーマット
cargo fmt

# Clippy チェック
cargo clippy --all-targets --all-features -- -D warnings

# コミット
git add .
git commit -m "fix(phase3): Fix all 30 build errors from Phase 3 Transform implementation

- Implement ScopeRoot::generate_unique_name() method
- Add missing fields to TemplateBuilder (needs_import_node, nodes, metadata)
- Add metadata field to RegularElement
- Fix type mismatches (Template vs TemplateBuilder, CompactString conversions)
- Fix function argument count mismatches
- Fix remaining compilation errors
- Resolve unused variable warnings

All 30 compilation errors are now resolved. Build passes successfully.
"

# プッシュ
git push origin fix/phase3-build-errors
```

---

## ✅ 完了条件

以下の全てが満たされること：

1. ✅ `cargo build` がエラーなしで成功
2. ✅ 警告が10個以下に削減されている
3. ✅ `cargo test --test validator` が実行可能
4. ✅ 全ての変更がコミット・プッシュされている

---

## 📊 進捗トラッキング

作業中は以下のコマンドで進捗を確認：

```bash
# エラー数の推移
echo "Initial errors: $(cat /tmp/initial_errors.txt)"
echo "After structural fixes: $(grep '^error' /tmp/after_structural_fixes.txt | wc -l)"
echo "After type fixes: $(grep '^error' /tmp/after_type_fixes.txt | wc -l)"
echo "After all fixes: $(grep '^error' /tmp/after_all_fixes.txt | wc -l)"
echo "Final: $(grep '^error' /tmp/final_build.txt | wc -l)"

# グラフ的に表示
echo "Progress:"
echo "30 ████████████████████████████████ Initial"
echo "→  ████████████████████████░░░░░░░ After Task 1-3"
echo "→  ██████████░░░░░░░░░░░░░░░░░░░░ After Task 4-5"
echo "→  █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ After Task 6"
echo "→  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Complete! ✓"
```

---

## 🎯 次のステップ（このタスク完了後）

1. **Validator テストの実行と結果分析**
   - `cargo test --test validator`
   - 現在の合格率を確認
   - 失敗しているテストの原因を分析

2. **Phase 3 Transform 第2バッチの実装**
   - 優先度: 高の8ファイル（AwaitBlock, KeyBlock, SnippetBlock, etc.）
   - 今回の教訓を活かして、構造を理解してから実装

3. **継続的な改善**
   - 定期的にテストを実行
   - 合格率の向上を目指す

---

## 📚 参考資料

- `PHASE3_IMPLEMENTATION_STATUS.md` - 実装状況の詳細
- `CLAUDE.md` - プロジェクトのガイドライン
- `TODO_IMPLEMENTATION_GUIDE.md` - Phase 2 の実装ガイド
- JavaScript 原本: `svelte/packages/svelte/src/compiler/phases/3-transform/`

---

**作成日:** 2026-01-10
**想定作業時間:** 2-4時間
**難易度:** 中（構造理解が必要だが、手順は明確）
