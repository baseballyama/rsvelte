# Phase 2 Analyze - Visitor 実装の修正指示書

## 実装状況サマリー

**日付**: 2026-01-10
**テスト結果**: 81/312 合格 (26.0%)
**ビルド状態**: ✅ 成功（警告42件あり）

## 完了した作業

34個の Phase 2 Analyze visitor ファイルを JavaScript から Rust に完全移植しました：

- IfBlock.js → if_block.rs
- ImportDeclaration.js → import_declaration.rs
- KeyBlock.js → key_block.rs
- LabeledStatement.js → labeled_statement.rs
- LetDirective.js → let_directive.rs
- Literal.js → literal.rs
- MemberExpression.js → member_expression.rs
- NewExpression.js → new_expression.rs
- OnDirective.js → on_directive.rs
- PropertyDefinition.js → property_definition.rs
- RegularElement.js → regular_element.rs
- RenderTag.js → render_tag.rs
- SlotElement.js → slot_element.rs
- SnippetBlock.js → snippet_block.rs
- SpreadAttribute.js → spread_attribute.rs
- SpreadElement.js → spread_element.rs
- StyleDirective.js → style_directive.rs
- SvelteBody.js → svelte_body.rs
- SvelteBoundary.js → svelte_boundary.rs
- SvelteComponent.js → svelte_component.rs
- SvelteDocument.js → svelte_document.rs
- SvelteElement.js → svelte_element.rs
- SvelteFragment.js → svelte_fragment.rs
- SvelteHead.js → svelte_head.rs
- SvelteSelf.js → svelte_self.rs
- SvelteWindow.js → svelte_window.rs
- TaggedTemplateExpression.js → tagged_template_expression.rs
- TemplateElement.js → template_element.rs
- Text.js → text.rs
- TitleElement.js → title_element.rs
- TransitionDirective.js → transition_directive.rs
- UpdateExpression.js → update_expression.rs
- UseDirective.js → use_directive.rs
- VariableDeclarator.js → variable_declarator.rs

## 現在の問題点と修正が必要な項目

### 1. 警告システムの未実装

**問題**: 警告が全く生成されていない（Expected N warnings, got 0）

**影響するテスト**:
- a11y-* （アクセシビリティ警告）
- component-name-lowercase
- ignore-warnings
- custom-element-props-*
- など多数

**修正方法**:
1. `ComponentAnalysis` 構造体に `warnings: Vec<AnalysisWarning>` フィールドを追加
   - ファイル: `src/compiler/phases/2_analyze/types.rs`

2. `VisitorContext` に警告を追加するメソッドを実装
   ```rust
   pub fn emit_warning(&mut self, warning: AnalysisWarning) {
       self.analysis.warnings.push(warning);
   }
   ```

3. 各 visitor で警告を emit するよう修正
   - 現在 `let _warning = warnings::xxx();` となっている箇所を修正
   - 例: `context.emit_warning(warnings::bidirectional_control_characters());`

**対象ファイル**:
- `src/compiler/phases/2_analyze/visitors/literal.rs` (bidirectional control characters)
- `src/compiler/phases/2_analyze/visitors/template_element.rs` (bidirectional control characters)
- `src/compiler/phases/2_analyze/visitors/new_expression.rs` (perf warnings)
- `src/compiler/phases/2_analyze/visitors/on_directive.rs` (event directive deprecated)
- `src/compiler/phases/2_analyze/visitors/svelte_component.rs` (svelte:component deprecated)
- `src/compiler/phases/2_analyze/visitors/svelte_self.rs` (svelte:self deprecated)
- `src/compiler/phases/2_analyze/visitors/slot_element.rs` (slot deprecated in runes)
- など

**JavaScript 対応箇所**: `svelte/packages/svelte/src/compiler/phases/2-analyze/index.js` の `state.warnings`

---

### 2. CSS バリデーションの未実装

**問題**: CSS関連のエラーが検出されていない

**影響するテスト**:
- css-invalid-global-selector-*
- css-invalid-combinator-selector-*
- css-invalid-global-placement-*
- css-invalid-type-selector-placement
- css-mismatched-quotes

**修正方法**:
CSS scoping と validation のロジックを実装する必要があります。

1. CSS selector のバリデーション強化
   - ファイル: `src/compiler/phases/2_analyze/css/`
   - グローバルセレクタの妥当性チェック
   - コンビネーターの妥当性チェック
   - 配置のバリデーション

2. CSS parser の改善
   - `:global()` の引数が妥当なセレクタか検証
   - タイプセレクタの配置検証
   - クオートの一致検証

**JavaScript 対応箇所**:
- `svelte/packages/svelte/src/compiler/phases/2-analyze/css/css-validate.js`
- `svelte/packages/svelte/src/compiler/phases/2-analyze/css/css-prune.js`

---

### 3. エラーコードの不一致

**問題**: 期待されるエラーコードと実際のエラーコードが異なる

**例**:
```
Expected error code 'transition_duplicate', got: Analysis(Validation("An element can only have one 'in' directive"))
```

**修正方法**:
1. エラーメッセージ生成時に正しい error code を使用
   - ファイル: `src/compiler/phases/2_analyze/errors.rs`
   - 各エラー関数が正しい code を返すよう確認

2. エラーの型を統一
   - `validation()` 関数を使用してエラーコードを明示
   - 現在 `error()` と `validation()` が混在しているため統一

**対象**:
- transition_duplicate
- その他のエラーコード

---

### 4. 未実装のバリデーション

**問題**: 以下のバリデーションが実装されていない

#### 4.1 Constant Assignment 検証
**エラーコード**: `constant_assignment`
**テスト**: const-tag-readonly-1, const-tag-readonly-2

**修正方法**:
- `ConstTag` への代入を検証
- const 宣言された変数への代入を検証
- ファイル: `src/compiler/phases/2_analyze/visitors/assignment_expression.rs` など

**JavaScript 対応箇所**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/AssignmentExpression.js`

#### 4.2 JavaScript Parse Error 検証
**エラーコード**: `js_parse_error`
**テスト**: each-block-invalid-context-destructured

**修正方法**:
- JavaScript 式のパースエラーを適切に報告
- OXC parser のエラーを Svelte エラーに変換
- ファイル: `src/compiler/phases/1_parse/read/expression.rs`

#### 4.3 Binding Name 検証
**エラーコード**: `bind_invalid_name`
**テスト**: window-binding-invalid-dimensions, document-binding-invalid-dimensions

**修正方法**:
- `<svelte:window>` と `<svelte:document>` で許可されていないバインディングを検証
- ファイル: `src/compiler/phases/2_analyze/visitors/bind_directive.rs`

**JavaScript 対応箇所**:
- `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/BindDirective.js`
- `svelte/packages/svelte/src/compiler/phases/2-analyze/validation.js` の `validate_element_binding`

#### 4.4 Svelte Element Missing This
**エラーコード**: `svelte_element_missing_this`
**テスト**: dynamic-element-missing-tag

**修正方法**:
- `<svelte:element>` に `this` 属性がない場合のエラー
- ファイル: `src/compiler/phases/2_analyze/visitors/svelte_element.rs`

---

### 5. Component Directive 検証

**問題**: コンポーネントに対する不正なディレクティブが検出されていない

**影響するテスト**:
- action-on-component
- animation-on-component
- transition-on-component

**修正方法**:
- Component と SvelteComponent に `use:`, `transition:`, `animate:` ディレクティブが使用されている場合にエラー
- ファイル: `src/compiler/phases/2_analyze/visitors/component.rs` (新規作成または既存の修正)

**JavaScript 対応箇所**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/Component.js` の validate_element

---

### 6. Module Export バリデーション

**問題**: モジュールの不正な export が検出されていない

**影響するテスト**:
- default-export-indirect
- default-export
- default-export-anonymous-function
- default-export-anonymous-class
- default-export-module

**修正方法**:
1. default export の禁止検証
2. module context での export let の禁止検証
- ファイル: `src/compiler/phases/2_analyze/visitors/export_named_declaration.rs` (新規作成)

**JavaScript 対応箇所**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/ExportDefaultDeclaration.js`

---

### 7. Reactive Declaration バリデーション

**問題**: リアクティブ宣言の循環参照などが検出されていない

**影響するテスト**:
- reactive-declaration-cyclical
- reactive-declaration-non-top-level
- module-script-reactive-declaration

**修正方法**:
1. 循環参照の検出
2. トップレベル以外での使用検出
3. モジュールスクリプトでの使用検出
- ファイル: `src/compiler/phases/2_analyze/visitors/labeled_statement.rs` の改善

**JavaScript 対応箇所**: `svelte/packages/svelte/src/compiler/phases/2-analyze/index.js` の reactive statement 分析

---

### 8. Custom Element Options バリデーション

**問題**: `customElement` オプションの検証が不完全

**影響するテスト**:
- custom-element-props-identifier-rest
- custom-element-props-identifier-props-option
- tag-custom-element-options-*

**修正方法**:
- `customElement` が string または object のみを受け付けるよう検証
- ファイル: `src/compiler/phases/1_parse/read/options.rs`

---

### 9. A11y (アクセシビリティ) 検証の未実装

**問題**: すべての a11y 警告が生成されていない

**影響するテスト**: a11y-* (約50個のテスト)

**修正方法**:
A11y 検証システム全体を実装する必要があります。

1. `src/compiler/phases/2_analyze/a11y/` ディレクトリを作成
2. 各 a11y ルールを実装
   - `a11y_alt_text.rs`
   - `a11y_aria_props.rs`
   - `a11y_no_static_element_interactions.rs`
   - など

3. RegularElement visitor から a11y チェックを呼び出す
   - ファイル: `src/compiler/phases/2_analyze/visitors/regular_element.rs`
   - `a11y_check()` 関数の実装

**JavaScript 対応箇所**: `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/a11y-*.js`

---

## 優先順位

### 最優先 (High Priority)
1. **警告システムの実装** - これだけで多くのテストが合格する
2. **エラーコードの統一** - テストフレームワークとの互換性向上

### 高優先 (Medium-High Priority)
3. **未実装バリデーションの実装**
   - constant_assignment
   - bind_invalid_name
   - svelte_element_missing_this

4. **Component Directive 検証**
5. **Module Export バリデーション**

### 中優先 (Medium Priority)
6. **CSS バリデーション**
7. **Reactive Declaration バリデーション**
8. **Custom Element Options バリデーション**

### 低優先 (Lower Priority)
9. **A11y 検証** - 大規模な作業だが、機能的には重要度が低い

---

## 次のステップ

1. **警告システムの実装から開始する**
   - `ComponentAnalysis` に warnings フィールドを追加
   - 各 visitor で警告を emit するよう修正
   - これだけで合格率が大幅に向上する見込み

2. **エラーコードの統一**
   - `errors.rs` のエラー関数を見直し
   - テストで期待されるコードと一致させる

3. **未実装バリデーションを1つずつ実装**
   - 優先順位の高いものから順に実装
   - 各実装後にテストを実行して進捗を確認

4. **定期的にテストを実行**
   ```bash
   cargo test --test validator -- --nocapture
   ```

---

## 移植における注意点

### JavaScript から Rust への対応関係

| JavaScript | Rust |
|-----------|------|
| `state.warnings.push(warning)` | `context.emit_warning(warning)` |
| `e.error_code(node)` | `return Err(errors::error_code())` |
| `w.warning_code(node)` | `context.emit_warning(warnings::warning_code())` |
| `context.next()` | visitor dispatch system が自動処理 |
| `context.visit(node)` | `walk_js_expression()`/`analyze()` など |
| `node.metadata.xxx` | metadata 構造体のフィールド |

### 既存パターンに従う

- エラー: `errors::function_name()` で `AnalysisError` を返す
- 警告: `warnings::function_name()` で `AnalysisWarning` を返す
- Visitor: `pub fn visit(...) -> Result<(), AnalysisError>`
- Helper: `pub fn utility_function(...)` in `shared/` ディレクトリ

---

## 参考資料

- JavaScript 実装: `svelte/packages/svelte/src/compiler/phases/2-analyze/`
- テストケース: `svelte/packages/svelte/tests/validator/samples/`
- エラー定義: `svelte/packages/svelte/messages/compile-errors/compile-errors.md`
- 警告定義: `svelte/packages/svelte/messages/compile-warnings/compile-warnings.md`
