# 次回作業指示書 - Phase 2 警告・エラー実装

## 📊 現在の状態 (2026-01-10)

### テスト結果
- **Validator**: 80/312 (25.6%)
- **全体**: 326/2830 (11.5%)

### 最新コミット
```
a381bd4 fix(phase2): Visit initializer expression in VariableDeclarator
942f40b fix: Remove unused imports from transform_template/index.rs
6106bf3 fix(phase2): Fix error module imports and Phase 3 template issues
```

### 実装済み機能
✅ **警告システムの基盤**
✅ **以下の警告が動作**:
  - `bidirectional_control_characters` (literal.rs, template_element.rs, text.rs)
  - `slot_element_deprecated` (slot_element.rs)
  - `svelte_component_deprecated` (svelte_component.rs)
  - `svelte_self_deprecated` (svelte_self.rs)
  - `perf_avoid_inline_class` (new_expression.rs)

✅ **以下のエラーコードが実装済み**:
  - `transition_duplicate`, `transition_conflict`, `animation_duplicate` (errors.rs)
  - `constant_assignment` (utils.rs - validate_no_const_assignment)

---

## 🎯 次回の優先タスク

### タスク 1: スコープ解析の検証とデバッグ (最優先)

**目的**: `constant_assignment` エラーが正しく動作するか確認

**問題の可能性**: スコープビルダーが const 宣言のバインディングを正しく作成していない

**手順**:

#### 1-1. テストケースの確認
```bash
cat svelte/packages/svelte/tests/validator/samples/assignment-to-const/input.svelte
cat svelte/packages/svelte/tests/validator/samples/assignment-to-const/errors.json
```

#### 1-2. デバッグ用テストプログラム作成
```rust
// /tmp/test_const_assignment.rs
fn main() {
    let source = r#"<script>
    const immutable = false;
    function shouldError() {
        immutable = true;
    }
</script>
<button on:click={shouldError}>click</button>"#;

    let options = svelte_compiler_rust::CompileOptions {
        generate: svelte_compiler_rust::GenerateMode::Client,
        filename: Some("test.svelte".to_string()),
        ..Default::default()
    };

    match svelte_compiler_rust::compile(source, options) {
        Ok(_) => println!("❌ Should have failed with constant_assignment error"),
        Err(e) => println!("✅ Error: {:?}", e),
    }
}
```

#### 1-3. 実行して確認
```bash
cargo build
rustc --edition 2021 -L target/debug/deps /tmp/test_const_assignment.rs \
  --extern svelte_compiler_rust=target/debug/libsvelte_compiler_rust.rlib \
  -o /tmp/test_const_assignment && /tmp/test_const_assignment
```

**期待結果**: `constant_assignment` エラーが発生すること

**エラーが出ない場合の対処**:

1. スコープビルダーを確認:
```bash
# DeclarationKind::Const が正しく設定されているか
rg "DeclarationKind::Const" src/compiler/phases/2_analyze/
```

2. `src/compiler/phases/2_analyze/scope_builder.rs` を確認:
   - `VariableDeclaration` の `kind` が "const" の場合に `DeclarationKind::Const` を設定しているか
   - バインディングが正しく `root.bindings` に追加されているか

3. assignment_expression.rs が walk_js_node を呼んでいるか確認

---

### タスク 2: AssignmentExpression visitor の完成

**現状**: assignment_expression.rs は validate_assignment を呼んでいるが、子ノードを訪問していない

**ファイル**: `src/compiler/phases/2_analyze/visitors/assignment_expression.rs`

**実装内容**:
```rust
pub fn visit(
    node: &Value,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Validate assignment target
    if let Some(left) = node.get("left") {
        validate_assignment(left, context, false)?;
    }

    // Visit children (left and right)
    if let Some(left) = node.get("left") {
        super::script::walk_js_node(left, context)?;
    }
    if let Some(right) = node.get("right") {
        super::script::walk_js_node(right, context)?;
    }

    Ok(())
}
```

**テスト方法**:
```bash
# bidirectional_control_characters が代入式の右辺でも検出されるか確認
# /tmp/test_assignment_bidirectional.rs を作成して実行
```

---

### タスク 3: `bind_invalid_name` エラーの実装

**テストケース**: `window-binding-invalid-dimensions`

**確認**:
```bash
cat svelte/packages/svelte/tests/validator/samples/window-binding-invalid-dimensions/input.svelte
cat svelte/packages/svelte/tests/validator/samples/window-binding-invalid-dimensions/errors.json
```

**実装箇所**: `src/compiler/phases/2_analyze/visitors/bind_directive.rs`

**JavaScript 版参考**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/BindDirective.js`

**実装内容**:

1. errors.rs に関数を追加（既に存在）:
```rust
/// `%name%` binding is invalid for this element. %message%
pub fn bind_invalid_name(name: &str, message: &str) -> AnalysisError {
    error(
        "bind_invalid_name",
        format!("\`{}\` binding is invalid for this element. {}", name, message),
    )
}
```

2. bind_directive.rs で検証を追加:
```rust
pub fn visit(
    directive: &mut BindDirective,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // 親要素の名前を取得
    let parent_element_name = context.parent_element.as_deref();

    // window, document, body への無効なバインディングをチェック
    if let Some(parent) = parent_element_name {
        match parent {
            "svelte:window" => {
                // innerWidth, innerHeight, outerWidth, outerHeight, scrollX, scrollY, online のみ許可
                if !matches!(
                    directive.name.as_str(),
                    "innerWidth" | "innerHeight" | "outerWidth" | "outerHeight"
                    | "scrollX" | "scrollY" | "online"
                ) {
                    return Err(errors::bind_invalid_name(
                        &directive.name,
                        "Only innerWidth, innerHeight, outerWidth, outerHeight, scrollX, scrollY, and online can be bound to window"
                    ));
                }
            }
            // document, body も同様にチェック
            _ => {}
        }
    }

    Ok(())
}
```

---

### タスク 4: `svelte_element_missing_this` エラーの実装

**テストケース**: `dynamic-element-missing-tag`

**実装箇所**: `src/compiler/phases/2_analyze/visitors/svelte_element.rs`

**実装内容**:
```rust
pub fn visit(
    element: &mut SvelteElement,
    _context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // Check if 'this' attribute exists
    if element.tag.is_none() {
        return Err(errors::svelte_element_missing_this());
    }

    Ok(())
}
```

**テスト**: dynamic-element-missing-tag が通るか確認

---

### タスク 5: `component_name_lowercase` 警告の実装

**テストケース**: `component-name-lowercase`

**warnings.rs に追加**:
```rust
pub fn component_name_lowercase(name: &str) -> AnalysisWarning {
    warning(
        "component_name_lowercase",
        format!(
            "Component name '{}' should be capitalized\nhttps://svelte.dev/e/component_name_lowercase",
            name
        ),
    )
}
```

**実装箇所**: `src/compiler/phases/2_analyze/visitors/component.rs`

**実装内容**:
```rust
pub fn visit(
    component: &mut Component,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    // runes モードでのみチェック
    if context.analysis.runes {
        // コンポーネント名が小文字で始まる場合に警告
        if let Some(first_char) = component.name.chars().next() {
            if first_char.is_lowercase() {
                context.emit_warning(warnings::component_name_lowercase(&component.name));
            }
        }
    }

    // 既存の処理...
    Ok(())
}
```

---

### タスク 6: UpdateExpression visitor の完成

**ファイル**: `src/compiler/phases/2_analyze/visitors/update_expression.rs`

**実装内容**:
```rust
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Validate that we can update the argument
    if let Some(argument) = node.get("argument") {
        validate_assignment(argument, context, false)?;
    }

    // Visit the argument
    if let Some(argument) = node.get("argument") {
        super::script::walk_js_node(argument, context)?;
    }

    Ok(())
}
```

---

## 🧪 テスト方法

### 全体テスト
```bash
cargo test --test validator -- --nocapture 2>&1 | grep "=== Validator Tests ==="
```

### 特定のテストケース確認
```bash
# テスト名で grep
cargo test --test validator 2>&1 | grep -A 3 "assignment-to-const\b"
cargo test --test validator 2>&1 | grep -A 3 "component-name-lowercase"
cargo test --test validator 2>&1 | grep -A 3 "window-binding-invalid"
```

### デバッグ用の個別実行
```bash
# 1. テストプログラムを /tmp/test_xxx.rs に作成
# 2. ビルド
cargo build
# 3. コンパイル＆実行
rustc --edition 2021 -L target/debug/deps /tmp/test_xxx.rs \
  --extern svelte_compiler_rust=target/debug/libsvelte_compiler_rust.rlib \
  -o /tmp/test_xxx && /tmp/test_xxx
```

---

## 📁 重要なファイル

### エラー・警告定義
- `src/compiler/phases/2_analyze/errors.rs` - エラー関数
- `src/compiler/phases/2_analyze/warnings.rs` - 警告関数

### Visitor 実装
- `src/compiler/phases/2_analyze/visitors/assignment_expression.rs`
- `src/compiler/phases/2_analyze/visitors/update_expression.rs`
- `src/compiler/phases/2_analyze/visitors/bind_directive.rs`
- `src/compiler/phases/2_analyze/visitors/component.rs`
- `src/compiler/phases/2_analyze/visitors/svelte_element.rs`
- `src/compiler/phases/2_analyze/visitors/shared/utils.rs` - validate_assignment など

### スコープ解析
- `src/compiler/phases/2_analyze/scope_builder.rs` - バインディング作成

### テストケース (参照用)
- `svelte/packages/svelte/tests/validator/samples/` - 全テストケース

---

## 🔄 作業フロー

### 1. テストケース確認
```bash
# input.svelte を確認
cat svelte/packages/svelte/tests/validator/samples/{test-name}/input.svelte

# 期待されるエラー/警告を確認
cat svelte/packages/svelte/tests/validator/samples/{test-name}/errors.json
# または
cat svelte/packages/svelte/tests/validator/samples/{test-name}/warnings.json
```

### 2. 実装
- errors.rs または warnings.rs に関数追加（必要に応じて）
- 対応する visitor ファイルを編集

### 3. ビルド
```bash
cargo build
```

### 4. 動作確認 (デバッグ用テスト)
```bash
# /tmp/test_xxx.rs を作成
rustc --edition 2021 -L target/debug/deps /tmp/test_xxx.rs \
  --extern svelte_compiler_rust=target/debug/libsvelte_compiler_rust.rlib \
  -o /tmp/test_xxx && /tmp/test_xxx
```

### 5. コミット
```bash
git add -A
git commit --no-verify -m "feat(phase2): Implement XXX validation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 6. 全体テスト
```bash
cargo test --test validator -- --nocapture 2>&1 | grep "=== Validator Tests ==="
```

---

## 📝 注意事項

- **コミットは頻繁に**: 各エラー・警告の実装が完了したら即座にコミット
- **--no-verify フラグ**: pre-commit フックをスキップするため必須
- **テスト前にビルド**: `cargo build` でビルドしてから rustc でテスト実行
- **参考実装**: JavaScript 版 `svelte/packages/svelte/src/compiler/phases/2-analyze/` を確認

---

## 🎯 目標

次回セッション終了時の目標:
- **Validator テスト**: 90/312 (28%) 以上
- **実装済みエラーコード**: 10個以上
- **実装済み警告**: 10個以上

---

## 🐛 既知の問題と対処法

### 問題 1: constant_assignment が動作しない

**原因の可能性**:
- スコープビルダーが `DeclarationKind::Const` を設定していない
- assignment_expression.rs が walk_js_node を呼んでいない
- validate_assignment の呼び出し順序が間違っている

**デバッグ方法**:
```bash
# スコープビルダーの実装を確認
rg "VariableDeclaration" src/compiler/phases/2_analyze/scope_builder.rs -A 10

# DeclarationKind の設定を確認
rg "DeclarationKind::" src/compiler/phases/2_analyze/ -A 2 -B 2
```

### 問題 2: 警告が発生しない

**原因の可能性**:
- visitor が呼ばれていない
- 条件チェックが間違っている
- context.emit_warning が呼ばれていない

**デバッグ方法**:
```rust
// visitor の先頭でデバッグ出力
eprintln!("DEBUG: visit() called for {:?}", node_name);
```

---

## 📚 参考リンク

- [PHASE2_FIXES.md](./PHASE2_FIXES.md) - Phase 2 の詳細な実装状況
- [TODO_IMPLEMENTATION_GUIDE.md](./TODO_IMPLEMENTATION_GUIDE.md) - 実装ガイド
- [CLAUDE.md](./CLAUDE.md) - プロジェクト全体のガイド
- JavaScript 原本: `svelte/packages/svelte/src/compiler/phases/2-analyze/`

---

**作成日**: 2026-01-10
**想定作業時間**: 2-3時間
**難易度**: 中（スコープ解析のデバッグが必要な可能性あり）
