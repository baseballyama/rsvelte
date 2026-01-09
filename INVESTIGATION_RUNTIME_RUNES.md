# Runtime Runes テスト調査レポート

**調査日**: 2026-01-10
**調査対象**: runtime-runes テストが 1.4% (10/724) しかパスしていない理由

## 🔍 調査結果

### 根本原因

**Phase 3 (Transform) のクライアントサイドコード生成がほぼ未実装**

### 詳細

#### 実装状況

**Phase 1 (Parse)**: ✅ ほぼ完成
- Parser modern: 22/22 (100%)
- Parser legacy: 82/82 (100%)

**Phase 2 (Analyze)**: ⚠️ 部分的に実装
- Visitor の基礎構造は存在
- 一部の TODO が残っている

**Phase 3 (Transform)**:
- **Server-side**: 🟡 部分的に実装（109/724 = 15% 通過）
- **Client-side**: ❌ ほぼ未実装（10/724 = 1.4% 通過）

#### Phase 3 Client Visitor の実装状況

**実装済み**（4個）:
- ✅ `animate_directive.rs`
- ✅ `arrow_function_expression.rs`
- ✅ `assignment_expression.rs`
- ✅ `expression_converter.rs`

**未実装**（14個以上）:
- ❌ `fragment.rs` - Fragment visitor（最重要）
- ❌ `text.rs` - Text node visitor
- ❌ `regular_element.rs` - 通常の HTML 要素（最重要）
- ❌ `component.rs` - コンポーネント呼び出し
- ❌ `expression_tag.rs` - `{expressions}`
- ❌ `html_tag.rs` - `{@html}`
- ❌ `render_tag.rs` - `{@render}`
- ❌ `if_block.rs` - `{#if}` ブロック（重要）
- ❌ `each_block.rs` - `{#each}` ブロック（重要）
- ❌ `await_block.rs` - `{#await}` ブロック
- ❌ `key_block.rs` - `{#key}` ブロック
- ❌ `snippet_block.rs` - `{#snippet}` ブロック
- ❌ `attribute.rs` - 属性の生成
- ❌ `svelte_element.rs` - 動的要素

### テスト結果の詳細

#### パスしているテスト（10個）

非常にシンプルなケースのみ：
- `pre-no-content` - 空の `<pre></pre>` タグ
- `comment-separated-text` - 静的テキストとコメント
- `bigint-increment` - スクリプトのみ、テンプレートなし
- `array-lastindexof` - スクリプトのみ
- その他スクリプト中心のテスト

#### 失敗しているテスト（714個）

ほぼすべてが "Client JS mismatch" で失敗：

**具体例**:

1. **`action-context`** - `{#if}` ブロックとイベントハンドラが完全に欠落
   ```javascript
   // 期待: ボタン要素、{#if}ブロック、onclick ハンドラ、use:action
   // 実際: 空のコメントノード `<!>`
   ```

2. **`1000-reading-derived-effects`** - コンポーネント呼び出しが空のテキストに
   ```javascript
   // 期待: Component($$anchor, {})
   // 実際: $.text() // 空のテキストノード
   ```

3. **`attachment-basic`** - `@attach` ディレクティブが無視される
   ```javascript
   // 期待: $.attach(div, () => (node) => node.textContent = node.nodeName)
   // 実際: ディレクティブが完全に欠落
   ```

### コンパイルエラーの修正

調査中に発見・修正した問題：

1. **モジュールパスエラー** ✅ 修正済み
   - `use crate::compiler::phases::2_analyze` → `phase2_analyze`
   - Rust では数字で始まる識別子は使えない

2. **依存関係の問題** ✅ 修正済み
   - `once_cell::sync::Lazy` → `std::sync::LazyLock`
   - Cargo.toml に once_cell が含まれていなかった

3. **型エラー** ✅ 修正済み
   - `Expression::start()` が `Option<u32>` を返す
   - `.unwrap_or(0)` で unwrap してから `as usize` でキャスト

## 📊 統計

### Runtime Runes テスト結果

| メトリック | 数値 | パーセント |
|-----------|------|-----------|
| Total tests | 740 | - |
| Passed | 10 | 1.4% |
| Failed | 714 | 96.5% |
| Skipped | 16 | 2.2% |
| Client passed | 10/724 | 1.4% |
| Server passed | 109/724 | 15.0% |

### 他のテストとの比較

| テストカテゴリ | 通過率 |
|--------------|--------|
| Parser Modern | 100% ✅ |
| Parser Legacy | 100% ✅ |
| Compiler Snapshot | 94.1% ✅ |
| CSS | 62.1% 🟡 |
| Runtime Runes | **1.4%** ❌ |
| Runtime Legacy | 1.1% ❌ |
| SSR | 12.5% ❌ |

→ **Parser は完璧だが、Transform (特に Client) が未実装**

## 🎯 推奨される対応

### 優先順位

1. **最優先**: Phase 3 Client Visitor の実装
   - `regular_element.rs`（最も基礎的）
   - `fragment.rs`
   - `text.rs`

2. **高優先**: 制御フロー
   - `if_block.rs`
   - `each_block.rs`

3. **中優先**: コンポーネント
   - `component.rs`
   - `attribute.rs`

### 実装ガイド

詳細な実装手順とパターンは **[PHASE3_CLIENT_GUIDE.md](./PHASE3_CLIENT_GUIDE.md)** を参照。

### 期待される成果

各マイルストーンでの目標テスト通過率：

| マイルストーン | 実装内容 | 目標通過率 |
|------------|---------|----------|
| 1 | 静的要素 | 20% |
| 2 | 動的コンテンツ | 35% |
| 3 | 制御フロー | 50% |
| 4 | コンポーネント | 60% |
| 5 | 高度な機能 | 70%+ |

## 🔗 関連ドキュメント

- **[PHASE3_CLIENT_GUIDE.md](./PHASE3_CLIENT_GUIDE.md)** - Phase 3 実装の詳細ガイド
- **[CLAUDE.md](./CLAUDE.md)** - プロジェクト全体のガイドライン
- **[TODO_QUICKSTART.md](./TODO_QUICKSTART.md)** - Phase 2 の TODO 実装ガイド

## 📝 結論

「それなりに実装した」のは **Parser (Phase 1)** であり、**Transform (Phase 3)** のクライアントサイドはほぼ白紙状態。

基本的な visitor を実装することで、テスト通過率を **1.4% → 50%+** に引き上げることが可能。

公式 Svelte の JavaScript 実装を参考にしながら、Rust で visitor を実装していく必要がある。
