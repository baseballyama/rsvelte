# Phase 2 Validator 実装 - 次のタスク

## 完了した作業 (2026-01-10)

### Task 1: Scope 解析の検証とデバッグ ✅
- **実装内容:**
  - `constant_assignment` エラー検出の修正
  - `expression_statement.rs` visitor での walk_js_node 呼び出し追加
  - `function_declaration.rs` でのエラー伝播修正
  - FunctionDeclaration の body/params の OXC AST 変換実装
  - AssignmentExpression の OXC AST 変換実装

- **結果:** Validator 80/312 → 81/312

### Task 2: scope_builder の OXC AST 実装 ✅
- **実装内容:**
  - テキストベースの行単位パースを完全に OXC AST トラバーサルに置き換え
  - 分割代入の完全サポート (object/array patterns)
  - ルーン検出の改善 ($state, $state.raw, $derived, $props)
  - TypeScript サポート (lang 属性の検出)
  - Import/Export 宣言の処理

- **主要な実装:**
  - `process_program()` - OXC Program AST のトラバース
  - `process_statement()` - すべての statement タイプの処理
  - `process_variable_declaration()` - 変数宣言と DeclarationKind
  - `process_binding_pattern()` - 再帰的なパターン処理
  - `detect_binding_kind_from_expr()` - AST ベースのルーン検出
  - `process_import_declaration()` - import specifier の処理

- **結果:** Validator 81/312 → 82/312 (26.0% → 26.3%)
- **Commit:** a005539 "feat(phase2): Rewrite scope_builder to use OXC AST parsing"

## 現在のテスト状況

**Validator: 82/312 passed (26.3%)**
- 230 tests failing
- 11 tests skipped (module compilation not implemented)

**Overall: 343/2830 tests passed (12.1%)**

## 次に優先すべきタスク

### 優先度 1: CSS 検証エラーの実装 (クイックウィン)
- **対象テスト:** 19 tests (6.1%)
- **期待改善:** 82/312 → 101/312 (32.4%)
- **難易度:** 低 (CSS パーサー既存)
- **推定工数:** 1-2 日

**実装が必要なエラー:**
1. `css_global_invalid_selector` - :global() 内の複数セレクター検出 (6 tests)
2. `css_selector_invalid` - 無効なセレクター構文 (4 tests)
3. `css_global_invalid_selector_list` - :global() のカンマ分離セレクター (4 tests)
4. `css_global_invalid_placement` - :global() の無効な配置

**実装場所:**
- `src/compiler/phases/2_analyze/css/validator.rs` (新規作成)
- または `src/compiler/phases/3_transform/css.rs` に validation 追加

**例:**
```svelte
<style>
  div :global(:is(h1, h2)) { }  /* ❌ css_global_invalid_selector */
  div :global(h1, h2) { }        /* ❌ css_global_invalid_selector_list */
</style>
```

**参考:** `svelte/packages/svelte/src/compiler/phases/2-analyze/css/css-validate.js`

---

### 優先度 2: 要素属性エラーの実装
- **対象テスト:** 15+ tests (4.8%)
- **期待改善:** 101/312 → 116/312 (37.2%)
- **難易度:** 低-中
- **推定工数:** 1.5-2 日

**実装が必要なエラー:**
1. `attribute_invalid_name` - 無効な属性名 (5 tests)
2. `illegal_element_attribute` - 要素に不適切な属性
3. `attribute_contenteditable_dynamic` - contenteditable 動的値禁止
4. `attribute_contenteditable_missing` - contenteditable 属性必須チェック

**実装場所:**
- `src/compiler/phases/2_analyze/visitors/regular_element.rs` (既存 visitor に追加)
- または `src/compiler/phases/2_analyze/validators/attribute.rs` (新規)

**例:**
```svelte
<input on:click={handler} />      <!-- ❌ attribute_invalid_name -->
<div contenteditable={value} />   <!-- ❌ attribute_contenteditable_dynamic -->
```

---

### 優先度 3: A11y 警告システムの実装 (最大影響)
- **対象テスト:** 49 tests (15.7%)
- **期待改善:** 116/312 → 165/312 (52.9%)
- **難易度:** 中-高
- **推定工数:** 4-6 日

**実装が必要な A11y ルール:**
1. `a11y-aria-props` - 無効な ARIA 属性
2. `a11y-no-distracting-elements` - <marquee>, <blink> の使用
3. `a11y-missing-attribute` - alt, label などの欠落
4. `a11y-invalid-attribute` - 無効な属性値
5. `a11y-role-supports-aria-props` - ARIA role とプロパティの互換性
6. その他多数の A11y ルール

**実装場所:**
- 新規ディレクトリ: `src/compiler/phases/2_analyze/validators/a11y/`
  - `mod.rs` - A11y validator のエントリポイント
  - `aria.rs` - ARIA 属性とロール検証
  - `elements.rs` - 要素別の A11y ルール
  - `attributes.rs` - 属性の A11y 検証
  - `roles.rs` - ARIA ロール定義とマッピング

**参考:**
- `svelte/packages/svelte/src/compiler/phases/2-analyze/validation.js`
- `svelte/packages/svelte/src/compiler/phases/2-analyze/a11y.js`

**実装ステップ:**
1. ARIA ロール定義テーブルの作成 (HTMLElement → 有効なロール)
2. ARIA プロパティ検証ロジック (required/implicit/supported)
3. インタラクティブ/非インタラクティブロール判定
4. 冗長ロール検出 (`role="button"` on `<button>`)
5. 各 A11y 警告関数の実装 (20+ 関数)

---

### 優先度 4: Scope Binding Tracking の調査
- **対象テスト:** 約 15 tests (4.8%)
- **期待改善:** 165/312 → 180/312 (57.7%)
- **難易度:** 中
- **推定工数:** 1-2 日

**調査が必要:**
scope_builder を OXC AST に改善したが、まだ失敗しているテストがある原因を特定:
1. どのテストが失敗しているか特定
2. scope_builder で何が不足しているか分析
3. visitor での binding 参照処理の問題を調査

**アプローチ:**
1. 失敗しているテストケースを個別に実行してログ確認
2. デバッグ出力で scope/binding の状態を確認
3. 不足している処理を特定して実装

**可能性のある問題:**
- ネストしたスコープの処理
- 関数パラメータのバインディング
- クロージャー内の変数参照
- Rune の特殊ケース ($state.raw, $derived.by など)

---

### 優先度 5: その他のエラー検出
- **対象テスト:** 約 20+ tests
- **期待改善:** 180/312 → 200/312 (64.1%)
- **難易度:** 中
- **推定工数:** 2-3 日

**実装が必要なエラー:**
1. `component_invalid_directive` - コンポーネントへの無効な directive (4 tests)
2. `tag_invalid_placement` - 無効な位置への要素配置 (6 tests)
3. `module_illegal_default_export` - module script での default export
4. `svelte_element_missing_this` - <svelte:element> の this 欠落
5. `bind_invalid_value` - バインディングの無効な値 (5 tests)
6. `node_invalid_placement` - ノード配置位置の検証
7. `block_invalid_placement` - ブロック配置の検証

---

## 実装の進め方

### サブエージェントを活用した並列作業

**調査フェーズ (並列実行):**
```bash
# 3つの Explore agent を並列で起動
1. Explore agent: CSS エラーテストの詳細分析
2. Explore agent: 属性エラーテストの詳細分析
3. Explore agent: A11y 警告テストの詳細分析
```

**実装フェーズ (並列実行):**
```bash
# 独立したタスクを複数の General-purpose agent で同時実行
1. General-purpose agent: CSS validator の実装
2. General-purpose agent: 属性 validator の実装
3. General-purpose agent: A11y validator の基本構造実装
```

**検証フェーズ:**
```bash
1. テスト実行とデバッグ
2. 個別にコミット
3. 次のタスクへ
```

### 推奨アプローチ

1. **まず調査から開始** - Explore agent で現状分析
2. **小さく実装** - 1つのエラータイプずつ実装してテスト
3. **頻繁にコミット** - 機能ごとに commit して進捗を保存
4. **並列実行** - 独立したタスクは複数の agent で同時実行
5. **テストファーストで検証** - 実装後すぐにテスト実行

### コミットメッセージの例

```
feat(phase2): Implement CSS :global() validation

Add validation for :global() selector usage to detect invalid patterns.

Changes:
- Add css/validator.rs with :global() checks
- Implement css_global_invalid_selector error detection
- Implement css_global_invalid_selector_list error detection
- Add tests for CSS validation

Test improvement: Validator 82/312 → 95/312 (26.3% → 30.4%)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 参考情報

### Svelte 公式の該当ファイル
- `svelte/packages/svelte/src/compiler/phases/2-analyze/validation.js` - メインの validation ロジック
- `svelte/packages/svelte/src/compiler/phases/2-analyze/css/css-validate.js` - CSS validation
- `svelte/packages/svelte/src/compiler/phases/2-analyze/a11y.js` - A11y validation
- `svelte/packages/svelte/src/compiler/phases/2-analyze/visitors/*.js` - 各 visitor の実装

### 既存の実装パターン
- `src/compiler/phases/2_analyze/visitors/assignment_expression.rs` - エラー検出の例
- `src/compiler/phases/2_analyze/visitors/shared/utils.rs` - validation ユーティリティ
- `src/compiler/phases/2_analyze/errors.rs` - エラー関数定義

### テスト方法

```bash
# 全 Validator テストを実行
cargo test --test validator

# 詳細な出力で実行
cargo test --test validator -- --nocapture

# 特定のテストケースのみ実行 (grep で絞り込み)
cargo test --test validator -- --nocapture 2>&1 | grep "css-"

# 失敗したテストのみ表示
cargo test --test validator 2>&1 | grep "Expected error"

# デバッグログ付きで実行
RUST_LOG=debug cargo test --test validator -- --nocapture
```

### デバッグテクニック

1. **特定のテストケースのみを実行:**
```bash
# fixtures/validator-modern/ から特定のテストを選択
ls fixtures/validator-modern/ | grep "css-global"
```

2. **エラー出力の確認:**
```rust
// visitor 内でデバッグ出力
eprintln!("DEBUG: node = {:#?}", node);
eprintln!("DEBUG: context.analysis.runes = {}", context.analysis.runes);
```

3. **AST の確認:**
```bash
# Svelte 公式コンパイラで AST を生成
node scripts/parse-with-svelte.mjs test.svelte
```

---

## 期待される最終目標

**短期目標 (1-2 週間):**
- Validator: 82/312 (26.3%) → 180/312 (57.7%)
- CSS、属性、A11y の主要なエラー/警告検出機能の実装

**中期目標 (1 ヶ月):**
- Validator: 180/312 (57.7%) → 250/312 (80.1%)
- すべての主要なエラーカテゴリーの実装完了

**長期目標 (2-3 ヶ月):**
- Validator: 250/312 (80.1%) → 300/312 (96.2%)
- エッジケースと細かいルールの実装

---

## 開始方法

### 1. 環境確認
```bash
# ブランチとテスト状況を確認
git status
cargo test --test validator 2>&1 | grep "Total:"
```

### 2. このファイルを読む
現在のファイル `NEXT_TASK_PHASE2_VALIDATORS.md` を読んで優先順位を理解

### 3. タスクを選択
推奨: **優先度 1 (CSS 検証エラー)** から開始 (最も簡単で効果が高い)

### 4. サブエージェントに調査を依頼
```
Explore agent に依頼:
"CSS :global() validation のテストケースを分析し、実装要件を整理してください"
```

### 5. 実装を依頼
```
General-purpose agent に依頼:
"src/compiler/phases/2_analyze/css/validator.rs を作成し、
css_global_invalid_selector エラーを検出する実装をしてください"
```

### 6. テストと検証
```bash
cargo test --test validator -- --nocapture 2>&1 | grep "css-"
```

### 7. コミット
```bash
git add -A
git commit -m "feat(phase2): Implement CSS :global() validation"
```

### 8. 次のタスクへ
優先度 2 (属性エラー) に進む

---

**重要:** サブエージェントを並列実行することで効率的に進められます。独立したタスク (CSS validation と 属性 validation など) は同時に別々の agent で実装可能です。
