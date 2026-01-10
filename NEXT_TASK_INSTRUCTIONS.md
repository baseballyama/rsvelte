# 次のタスク指示書 - Phase 3 Client Visitor 実装

## 📊 現在の状態（2026-01-10）

### ✅ 完了した作業

#### Phase 2 - IfBlock metadata サポート（2026-01-09）
- `ExpressionMetadata`にasync関連フィールド追加（`has_await`, `has_call`, `is_async()`など）
- `IfBlockMetadata`を定義し、`IfBlock`にmetadataフィールド追加
- Phase 2でtest expression分析の基盤構築
- Phase 3でmetadataを使用してasync式を正しく処理

#### Phase 3 - Visitor統合（2026-01-09）
- `visit_if_block()`メソッド実装 → `if_block::if_block()`を呼び出し
- `visit_regular_element()`メソッド実装 → `regular_element::visit_regular_element()`を呼び出し
- モジュールexport設定（`if_block`, `regular_element`, `utils`）

#### Phase 3 - Fragment visitor 有効化と修正（2026-01-10）
- Fragment visitor の型互換性問題を全て解決
- `parse_namespace()` 関数を追加（String → Namespace enum変換）
- `let_directives` を `Vec<JsStatement>` に変換
- `build_render_statement()` の引数修正
- CompactString → String変換を追加
- mod.rs で fragment module を有効化
- テストコードを新API対応（utils.rs）
- コミット: `07c6b6e` - "fix: Enable Fragment visitor and fix type compatibility issues"

#### Phase 3 - process_children() とフラグメント処理（2026-01-10）
- `is_static_element()`, `cannot_be_set_statically()` ヘルパー関数実装
- `TextOrExpr` enum 追加（Text/ExpressionTag のシーケンス処理用）
- `process_children()` 関数実装（text/expression の適切な処理）
- quasi と template literal ビルダーサポート追加
- `build_template_chunk()` 実装（template literal 生成）
- `convert_assignment_target` 関数名の typo 修正と重複削除
- namespace parsing ヘルパー追加
- コミット: `2637e39` - "feat(phase3): Implement process_children and fragment processing helpers"

#### Phase 3 - is_delegated_event_name 関数修正（2026-01-10）
- コンパイルエラー修正: `is_delegated_event_name` 関数が見つからない問題を解決
- Svelteの公式delegatable eventsリストに基づいた実装を追加
- 14種類のイベントタイプをサポート（beforeinput, click, change, dblclick, contextmenu, focusin, focusout, input, keydown, keyup, mousedown, mousemove, mouseout, mouseover, mouseup, pointerdown, pointermove, pointerout, pointerover, pointerup, touchend, touchmove, touchstart）
- テスト結果が改善: コンパイラスナップショット 12/19 → 15/19 (+3件)

### 📊 テスト結果（2026-01-10 14:10 測定）

#### is_delegated_event_name 修正後の結果

| テストスイート | 合格数 | 合格率 | 前回比 | 状態 |
|--------------|--------|--------|--------|------|
| コンパイラスナップショット | 15/19 | 78.9% | +3件 (12→15) | ✅ |
| Validator | 82/312 | 26.3% | +1件 (81→82) | 🟡 |
| Runtime-runes | 測定中 | - | - | ⏳ |

**改善**: `is_delegated_event_name`関数を再実装したことで、コンパイラスナップショットテストが**回復・改善**しました（12/19 → 15/19）。

#### 失敗の詳細

**コンパイラスナップショット（4件失敗）**:
1. `svelte-element` - `$props()` placement error (client & server)
2. `bind-component-snippet` - Client JS mismatch
3. `skip-static-subtree` - `$props()` placement error (client & server)
4. `props-identifier` - `$props()` placement error (client & server)

**新たに通過したテスト（+3件）**:
1. `nullish-coallescence-omittance` - Client
2. `await-block-scope` - Client
3. `state-proxy-literal` - Client

### ⚠️ 残っている課題

1. **$props() 識別子パターン対応** - **最重要課題**
   - 3つのテストが同じエラーで失敗: `props_invalid_placement: $props() can only be used with an object destructuring pattern`
   - 現状: `let { foo } = $props()` のみサポート
   - 必要: `let props = $props()` のような識別子パターンもサポート
   - 影響: 実装すれば 15/19 → 18/19 (94.7%) に到達可能

2. **each_block.rs のコンパイルエラー**
   - 既存の `each_block.rs` ファイルにコンパイルエラーが存在
   - 一時的に `.disabled` にリネームして無効化
   - mod.rs でもコメントアウト
   - types.rs の `visit_each_block()` も TODO に変更

3. **Clippy warnings** - 多数の既存コードに警告が存在（pre-commit hook で失敗の原因）
   - `collapsible_if`, `collapsible_match` など約26個のwarnings
   - 主に `2_analyze/visitors/regular_element.rs` と `3_transform/client/` に集中
   - これらは既存コードの問題であり、今回の実装とは無関係

4. **runtime-runes テスト** - Fragment/process_children の効果測定が未完了
   - テスト実行に時間がかかるため、結果確認が保留中
   - より小規模なテストセットでの検証が必要

---

## 🎯 次にやるべきこと（優先順位順）

### 📋 タスク優先順位サマリー（2026-01-10 14:10 更新）

| 優先度 | タスク | 所要時間 | 理由 | 影響 |
|--------|--------|----------|------|------|
| ⭐⭐⭐⭐⭐ | タスク0: $props()識別子パターン対応 | 1-2時間 | **最重要** - 3テストがこれで通る可能性 | 15/19 → 18/19 |
| ⭐⭐⭐⭐ | タスク1: bind-component-snippet修正 | 1-2時間 | snippet bindingの生成ロジック不完全 | 18/19 → 19/19 |
| ⭐⭐⭐ | タスク2: each_block.rs修正 | 30分-1時間 | コンパイルエラーを解消し、visitor を有効化 | runtime-runes改善 |
| ⭐⭐ | タスク3: Clippy warnings修正 | 1-2時間 | Pre-commit hookを通すために必要 | コード品質 |
| ⭐ | タスク4: Runtime-runes完全測定 | 2-4時間 | 724テスト全体の効果を測定 | 進捗把握 |

### 推奨実行順序

1. **タスク0（最優先・即実行）**: $props()識別子パターン対応 → 15/19 → 18/19 に到達
2. **タスク1（今日中）**: bind-component-snippet修正 → 18/19 → 19/19 (100%達成)
3. **タスク2（今日中）**: each_block.rs 修正 → コンパイルエラー解消
4. **タスク3（明日以降）**: Visitor実装 → 段階的にテスト合格率向上

---

## タスク0: テスト後退の原因調査【緊急・最優先】

### 概要
Fragment visitor を有効化したことで、コンパイラスナップショットテストが 15/19 → 12/19 に後退しました。原因を特定して修正する必要があります。

### 発生した問題
- **前回**: 15/19 通過（79%）
- **今回**: 12/19 通過（63%）
- **差分**: -3件（後退）

### 調査手順

#### 1. どのテストが新たに失敗したか特定
前回（Fragment visitor 無効時）と今回（Fragment visitor 有効時）の差分を確認します。

```bash
# 前回のコミットをチェックアウトしてテスト実行
git log --oneline | head -5  # コミット履歴確認
git diff HEAD~2 HEAD -- src/compiler/phases/3_transform/client/visitors/fragment.rs

# または、Fragment visitor を一時的に無効化してテスト
# → mod.rs で fragment をコメントアウト
# → types.rs の visit_fragment() を TODO に変更
```

#### 2. 失敗テストの詳細確認
```bash
# 失敗しているテストケースのソースを確認
cat fixtures/*/snapshot/nullish-coallescence-omittance/input.svelte
cat fixtures/*/snapshot/nullish-coallescence-omittance/_expected/client.js

# 実際の出力を確認（テスト実行時の差分を見る）
cargo test --test compiler_fixtures test_compiler_snapshot_fixtures -- --nocapture 2>&1 | grep -A 10 "nullish-coallescence"
```

#### 3. Fragment visitor の実装を見直す
```bash
# Fragment visitor 実装を確認
cat src/compiler/phases/3_transform/client/visitors/fragment.rs

# 公式実装と比較
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Fragment.js
```

#### 4. 原因の仮説
- Fragment visitor の `process_children()` が正しく動作していない可能性
- テンプレートの生成ロジックに問題がある可能性
- ステートメントの順序が違う可能性

### 修正方法

原因が特定できたら、以下のいずれかを実施：

1. **Fragment visitor を修正** - 実装ミスを修正
2. **Fragment visitor を一時的に無効化** - 他のvisitorを先に実装
3. **テスト期待値を確認** - テストケース自体に問題がないか確認

### 所要時間
30分-1時間

---

## タスク1: テスト結果確認と効果測定【完了】

### 概要
Fragment visitor と process_children() 実装の効果を確認する。

### 実行手順
```bash
# 小規模なテストから実行（コンパイラスナップショット）
cargo test --test compiler_fixtures -- --nocapture

# runtime-runes テストの一部を実行（最初の10件のみ）
cargo test --test runtime test_runtime_runes -- --nocapture 2>&1 | head -100
```

### 成功基準
- コンパイラスナップショット: 15/19 → 17/19+ (89%+)
- runtime-runes: 7/724 → 15/724+ (2%+)

### 所要時間
10-20分

---

## タスク2: Clippy warnings の修正【高優先度】

### 概要
Pre-commit hook が失敗する原因となっているclippy warningsを修正する。26個の警告のうち、主要なものを修正。

### 実行手順

#### Step 1: 警告の確認
```bash
cargo clippy --all-targets --all-features -- -D warnings 2>&1 | grep "error:" | head -30
```

#### Step 2: 主要な警告タイプを修正

**2-1. `collapsible_if` の修正（約10箇所）**

`regular_element.rs` 367行目など:
```rust
// Before
if let Attribute::Attribute(attr_node) = attr {
    if attr_node.name == "value" {
        return Err(...);
    }
}

// After
if let Attribute::Attribute(attr_node) = attr
    && attr_node.name == "value" {
    return Err(...);
}
```

**2-2. `collapsible_match` の修正（約5箇所）**

`regular_element.rs` 453行目など:
```rust
// Before
if let Some(ancestor) = context.path.get(i) {
    if let TemplateNode::RegularElement(ancestor_el) = ancestor {
        // ...
    }
}

// After
if let Some(TemplateNode::RegularElement(ancestor_el)) = context.path.get(i) {
    // ...
}
```

**2-3. `too_many_arguments` の修正（1箇所）**

`utils.rs` 50行目の `clean_nodes()` 関数:
```rust
// 引数をstructにまとめる
pub struct CleanNodesOptions<'a> {
    pub parent: Option<&'a TemplateNode>,
    pub nodes: &'a [TemplateNode],
    pub path: &'a [&'a TemplateNode],
    pub namespace: Namespace,
    pub bound_contenteditable: bool,
    pub preserve_whitespace: bool,
    pub preserve_comments: bool,
}

pub fn clean_nodes(options: CleanNodesOptions) -> CleanedNodes {
    // ...
}
```

#### Step 3: 修正後の確認
```bash
cargo clippy --all-targets --all-features -- -D warnings
cargo fmt
```

#### Step 4: コミット
```bash
git add .
git commit -m "style: Fix clippy warnings for collapsible_if and collapsible_match

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

### 成功基準
- Clippy warnings が 26 → 0 になる
- Pre-commit hook が成功する

### 所要時間
1-2時間

---

## タスク3: 他の重要なVisitorの実装（process_children完了後）

### 優先順位

#### 3-1. `text.rs` - テキストノードの処理【高優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Text.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/text.rs`

**実装内容**:
```rust
use crate::ast::template::Text;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// Visit a Text node and generate client-side code.
pub fn text(node: &Text, context: &mut ComponentContext) -> JsBlockStatement {
    // 公式実装を参照して実装
    // テキストノードを $.text() で生成するコードを作る

    let id_name = context.state.memoizer.generate_id("text");
    let id = b::id(&id_name);

    // テキストデータを取得
    let data = &node.data;

    // $.text(data) を生成
    context.state.init.push(
        b::var_decl(&id_name, Some(b::call(b::member_path("$.text"), vec![b::string(data)])))
    );

    // $.append($$anchor, text) を生成
    let append_stmt = b::stmt(b::call(
        b::member_path("$.append"),
        vec![b::id("$$anchor"), id],
    ));

    JsBlockStatement {
        body: vec![append_stmt],
    }
}
```

**テスト**:
```bash
cargo build && cargo test --test compiler_fixtures -- --nocapture
```

#### 3-2. `if_block.rs` - if/else ブロックの処理【高優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/IfBlock.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/if_block.rs`

**注意点**:
- `{#if}`, `{:else if}`, `{:else}` の処理
- `$.if()` ランタイム関数を使用
- consequent と alternate の処理

#### 3-3. `each_block.rs` - each ブロックの処理【高優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/EachBlock.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/each_block.rs`

**注意点**:
- `{#each}` ブロックの処理
- `$.each()` ランタイム関数を使用
- key による最適化
- fallback (`:else`) の処理

#### 3-4. `regular_element.rs` - 通常のHTML要素の処理【中優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/RegularElement.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/regular_element.rs`

**注意点**:
- 通常のHTML要素 (`<div>`, `<span>` など)
- 属性の処理
- イベントハンドラーの処理
- ディレクティブの処理

#### 3-5. `component.rs` - コンポーネントの処理【中優先度】

**参照**: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Component.js`

**実装場所**: `src/compiler/phases/3_transform/client/visitors/component.rs`

**注意点**:
- Svelte コンポーネントの処理
- props の受け渡し
- slots の処理
- bindings の処理

### 実装手順（各Visitorごと）

1. **公式実装を読む**
   ```bash
   cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/[VisitorName].js
   ```

2. **対応するRustファイルを確認・作成**
   ```bash
   ls src/compiler/phases/3_transform/client/visitors/
   # 存在しない場合は作成
   touch src/compiler/phases/3_transform/client/visitors/[visitor_name].rs
   ```

3. **visitor関数を実装**
   ```rust
   pub fn visitor_name(
       node: &NodeType,
       context: &mut ComponentContext
   ) -> JsBlockStatement {
       // 実装
   }
   ```

4. **`mod.rs` に追加**
   ```rust
   // src/compiler/phases/3_transform/client/visitors/mod.rs
   pub mod visitor_name;
   ```

5. **visitor dispatch を更新**
   - `src/compiler/phases/3_transform/client/visitor.rs` を確認
   - `visit_node()` 関数でノードタイプに応じて適切なvisitorを呼び出す

### 確認方法
```bash
cargo build
cargo test --test compiler_fixtures -- --nocapture
cargo test --test runtime -- --nocapture | head -100
```

---

## タスク4: 失敗しているテストの調査と修正

### コンパイラスナップショットテストの失敗（4件）

**失敗しているテスト**:
1. `nullish-coallescence-omittance` - Client JS mismatch
2. `await-block-scope` - Client JS mismatch
3. `bind-component-snippet` - Client JS mismatch
4. `state-proxy-literal` - Client JS mismatch

### 調査手順

#### 1. テストケースの場所を確認
```bash
find fixtures -type d -name "nullish-coallescence-omittance"
ls fixtures/*/snapshot/nullish-coallescence-omittance/
```

#### 2. ソースと期待される出力を確認
```bash
# 入力ファイル
cat fixtures/*/snapshot/nullish-coallescence-omittance/input.svelte

# 期待されるクライアントコード
cat fixtures/*/snapshot/nullish-coallescence-omittance/_expected/client.js
```

#### 3. 実際の出力を生成して比較
```bash
# テストを実行すると、実際の出力が一時ファイルに保存される
cargo test --test compiler_fixtures test_compiler_snapshot_fixtures -- --nocapture

# または、手動でコンパイルしてみる
# (テストフレームワークが自動比較してくれる)
```

#### 4. 差分の原因を特定

よくある原因：
- `process_children` が未実装
- visitor が未実装（`if_block`, `each_block` など）
- ランタイム関数の呼び出し方が間違っている
- ステートメントの順序が違う

#### 5. 修正を実装

---

## タスク5: SSRテストの改善（現在 8/80）

### 優先度の高い失敗テスト

最初の10件：
1. `bindings-zero`
2. `textarea-value`
3. `select-value-implicit-value-complex`
4. `attribute-boolean`
5. `hydratable-clobbering`
6. `bindings-readonly`
7. `head-title`
8. `css-empty`
9. `bindings-empty-string`
10. `option-scoped-class`

### SSR実装の確認

SSRはサーバーサイドコード生成（HTML文字列を生成するJSコード）なので、クライアントとは異なるアプローチが必要です。

```bash
# SSR実装の確認
ls src/compiler/phases/3_transform/server/
cat src/compiler/phases/3_transform/server/mod.rs
```

### 調査手順

```bash
# テストケースを確認
cat fixtures/*/ssr/bindings-zero/input.svelte
cat fixtures/*/ssr/bindings-zero/_expected/server.js
```

### 注意点

- SSRはクライアント実装が完成してから取り組むのが効率的
- まずはクライアントvisitorを完成させることを優先

---

## 📝 実装時の重要ガイドライン

### 1. 必ず公式実装を参照する
```bash
# 対応するJavaScriptファイルを必ず読む
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/[FileName].js
```

**重要**: 公式実装を1行ずつRustに翻訳する気持ちで。独自の解釈や改良は後回し。

### 2. 型システムを正しく使う

```rust
// ComponentContext を使ってステート管理
context.state.init.push(stmt);
context.state.update.push(stmt);
context.state.hoisted.push(stmt);

// ComponentClientTransformState のフィールド
state.template.push_element(...);
state.memoizer.generate_id("base");
```

### 3. ビルダー関数を活用

```rust
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

// 変数宣言
let stmt = b::var_decl("myVar", Some(b::string("value")));

// 関数呼び出し
let expr = b::call(b::member_path("$.text"), vec![b::string("Hello")]);

// ステートメント
let stmt = b::stmt(expr);
```

### 4. テスト駆動開発

```bash
# 変更のたびにビルドとテストを実行
cargo build
cargo test --test compiler_fixtures -- --nocapture

# 1つのテストが通るごとにコミット
git add .
git commit -m "feat(phase3): Implement text visitor"
git push
```

### 5. 小さくコミット

```bash
# 機能ごと、ファイルごとにコミット
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
git add .
git commit -m "feat(phase3): Implement process_children function

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

---

## 🎯 目標（マイルストーン）

### マイルストーン1: Fragment visitor と process_children 完了 ✅ 完了
- [x] Fragment visitor の型互換性問題を解決
- [x] `process_children()` 実装（`fragment.rs` 内）
- [x] `is_static_element()`, `build_template_chunk()` 等のヘルパー実装
- [x] ビルド成功
- [ ] テスト効果測定（タスク1）

### マイルストーン2: Clippy warnings 解消とコード品質向上
- [ ] 26個のclippy warningsを修正
- [ ] Pre-commit hookが正常に動作
- [ ] コード品質が向上し、メンテナンス性が改善

### マイルストーン3: 主要Visitor実装完了
- [ ] `text.rs` 実装
- [ ] `if_block.rs` 完全実装（現在は基本部分のみ）
- [ ] `each_block.rs` 実装
- [ ] `regular_element.rs` 完全実装（現在は基本部分のみ）
- [ ] コンパイラスナップショット: 15/19 → 19/19 (100%)

### マイルストーン4: Runtime-runesテスト大幅改善
- [ ] Runtime-runesテスト: 7/724 → 100/724 以上 (13.8%+)
- [ ] SSRテスト: 8/80 → 30/80 以上 (38%+)

---

## 📚 参考資料

### ディレクトリ構造
```
src/compiler/phases/3_transform/
├── client/
│   ├── mod.rs                     # クライアント変換のエントリーポイント
│   ├── types.rs                   # ComponentClientTransformState など
│   ├── transform_template/
│   │   ├── mod.rs
│   │   ├── index.rs               # transform_template()
│   │   ├── template.rs            # Template struct
│   │   └── types.rs               # Element, Node など
│   └── visitors/
│       ├── mod.rs                 # visitorのエクスポート
│       ├── fragment.rs            # ✅ 実装済み
│       ├── text.rs                # ⚠️ 要実装
│       ├── if_block.rs            # ⚠️ 要実装
│       ├── each_block.rs          # ⚠️ 要実装
│       ├── regular_element.rs     # ⚠️ 要実装
│       ├── component.rs           # ⚠️ 要実装
│       ├── attribute.rs           # 既存
│       ├── program.rs             # 既存
│       └── shared/
│           ├── mod.rs
│           ├── utils.rs           # ヘルパー関数
│           ├── component.rs       # 既存
│           ├── element.rs         # 既存
│           └── process.rs         # ⚠️ 新規作成が必要
└── server/
    └── mod.rs                     # サーバー変換（SSR）
```

### 公式実装の対応
```
svelte/packages/svelte/src/compiler/phases/3-transform/client/
└── visitors/
    ├── Fragment.js            → fragment.rs ✅ 実装済み
    ├── Text.js                → text.rs ⚠️ 要実装
    ├── IfBlock.js             → if_block.rs ⚠️ 要実装
    ├── EachBlock.js           → each_block.rs ⚠️ 要実装
    ├── RegularElement.js      → regular_element.rs ⚠️ 要実装
    ├── Component.js           → component.rs ⚠️ 要実装
    └── shared/
        └── process.js         → process.rs ⚠️ 要実装
```

### 有用なコマンド

```bash
# ビルド確認
cargo build

# 全テスト実行
cargo test --lib

# 特定のテストスイート
cargo test --test compiler_fixtures -- --nocapture
cargo test --test ssr -- --nocapture
cargo test --test runtime -- --nocapture | head -100

# フォーマットとリント
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings

# 公式実装の確認
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/[FileName].js

# テストケースの確認
cat fixtures/*/snapshot/[test-name]/input.svelte
cat fixtures/*/snapshot/[test-name]/_expected/client.js
```

---

## ✅ 完了チェックリスト

### 今回のセッション（2026-01-10 13:10）
- [x] Fragment visitor の型互換性問題を解決
- [x] `process_children()` 関数実装（`fragment.rs` 内）
- [x] `is_static_element()` 等のヘルパー関数実装
- [x] ビルド成功
- [x] コミット＆プッシュ（2件）
  - `07c6b6e` - Fragment visitor 有効化
  - `2637e39` - process_children 実装
- [x] テスト結果確認
  - コンパイラスナップショット: 12/19（前回 15/19 から後退）
  - Validator: 81/312
- [x] 問題発見: Fragment visitor 有効化でテストが後退
- [x] 応急処置: each_block.rs を無効化（コンパイルエラー回避）
- [x] NEXT_TASK_INSTRUCTIONS.md を更新

### 次のセッション（緊急対応）
- [ ] タスク0: **テスト後退の原因調査** ← **最優先**
  - Fragment visitor 実装の問題を特定
  - 修正または一時的に無効化を検討
- [ ] タスク1: each_block.rs 修正
  - コンパイルエラーを解消
  - visitor を有効化
- [ ] タスク2: Clippy warnings 修正
- [ ] タスク3: 他のVisitor実装
  - [ ] `text.rs` 実装完了
  - [ ] `if_block.rs` 完全実装
  - [ ] `each_block.rs` 実装完了
  - [ ] `regular_element.rs` 完全実装
  - [ ] 各実装後にコミット＆プッシュ
- [ ] タスク4: 失敗しているスナップショットテストを調査・修正

---

## 💡 Tips

### 1. 一度に1つのタスクに集中する
まずは `process_children()` を完全に実装してから次のvisitorに進む。

### 2. 公式実装を完全にコピーする気持ちで
独自の解釈や改良は後回し。まずは100%互換性を目指す。

### 3. テストを頻繁に実行
変更のたびにビルドとテストを実行。後退に早く気づく。

### 4. 小さくコミット
機能ごと、ファイルごとにコミット。いつでも戻れるように。

### 5. 詰まったら公式実装を再読
JavaScriptのロジックを1行ずつRustに翻訳。わからない部分は周辺コードも読む。

### 6. デバッグ出力を活用
```rust
eprintln!("DEBUG: process_children called with {} nodes", nodes.len());
eprintln!("DEBUG: Generated expression: {:?}", expr);
```

---

## 🔍 デバッグ方法

### テストが失敗した場合

1. **期待される出力を確認**
   ```bash
   cat fixtures/*/snapshot/[test-name]/_expected/client.js
   ```

2. **実際の出力を確認**
   - テスト実行時に一時ファイルに保存される
   - または `eprintln!` でデバッグ出力

3. **差分を比較**
   - 何が違うのか（関数呼び出し、順序、変数名など）
   - なぜ違うのか（未実装の機能、ロジックの違いなど）

4. **公式実装を再確認**
   - 該当箇所のJavaScriptコードを読む
   - ロジックをRustに正確に翻訳

### ビルドエラーが出た場合

1. **エラーメッセージを注意深く読む**
   ```bash
   cargo build 2>&1 | head -50
   ```

2. **型が合わない場合**
   - `types.rs` で型定義を確認
   - builders を確認（`js_ast/builders.rs`）

3. **インポートエラーの場合**
   - `mod.rs` でモジュール宣言を確認
   - `use` 文のパスを確認

---

**作成日**: 2026-01-09
**最終更新**: 2026-01-10 13:10
**次回更新**: タスク0（テスト後退の原因調査）完了後
**推奨作業時間**:
- タスク0: 30分-1時間（緊急・原因調査）
- タスク1: 30分-1時間（each_block.rs修正）
- タスク2: 1-2時間（Clippy warnings修正）
- タスク3以降: 各1-3時間（Visitor実装）
