# パーサテスト修正 - 次のステップ

**現在の状況**: 18/22 テスト成功 (81.8%)
**目標**: 22/22 テスト成功 (100%)

## 残りの失敗テスト (4/22)

### 1. loose-invalid-expression (優先度: 高)

**問題**:
```
Parse error: SvelteError { code: "js_parse_error", message: "Unexpected token", span: (146, 146) }
```

**入力例**:
```svelte
<div {}></div>
<div foo={}></div>
<div foo={a.}></div>
<div foo={'hi}'.}></div>
<Component onclick={() => x.} />
<input bind:value={a.} />
asd{a.}asd
{foo[bar.]}
{#if x.}{/if}
{#each array as item (item.)}{/each}
```

**原因**:
- Svelte は "loose" モードで無効な JavaScript 式（`a.`, `x.` など）を許容する
- 現在の実装は OXC パーサーでエラーになった式を拒否している
- 空のショートハンド `{}` は修正済みだが、他の無効な式でまだエラーが発生

**調査手順**:
1. `input.svelte` の 146 文字目（エラー位置）を確認
2. どの式でエラーが発生しているか特定
3. 期待される出力 `output.json` を確認し、無効な式がどう扱われるべきか理解

**修正アプローチ**:
- **オプションA (推奨)**: `parse_expression` 関数を修正し、パースエラー時にも有効な AST ノードを返す
  - ファイル: `src/compiler/phases/1_parse/read/expression.rs`
  - `parse_expression_with_typescript` でエラー時の fallback を改善
  - 無効な式を `Identifier` または `MemberExpression` として部分的にパースする

- **オプションB**: 各呼び出し箇所でエラーハンドリングを追加
  - より多くの変更が必要で、保守性が低い

**参考箇所**:
```rust
// src/compiler/phases/1_parse/read/expression.rs:125-131
pub fn parse_expression(content: &str, offset: usize, line_offsets: &[usize]) -> Expression {
    parse_expression_with_typescript(content, offset, line_offsets, true).unwrap_or_else(|| {
        parse_expression_with_typescript(content, offset, line_offsets, false)
            .unwrap_or_else(|| create_invalid_identifier(offset, offset + content.len()))
    })
}
```

**期待される動作**:
- `a.` → 部分的に有効な `MemberExpression` として扱う
- `x.` → 同様に部分的な式として扱う
- エラーではなく、不完全なノードを生成

---

### 2. loose-unclosed-tag (優先度: 中)

**問題**:
```
Parse error: SvelteError { code: "unexpected_eof", message: "Unexpected end of input", span: (205, 205) }
```

**入力**:
```svelte
<div>
	<Comp>
</div>
<div>
	<Comp foo={bar}
</div>
...
<open-ended
```

**原因**:
- パーサーが未閉じタグで EOF に到達すると `unexpected_eof` エラーを返す
- Svelte の "loose" モードは未閉じタグを許容し、自動的に閉じる

**調査手順**:
1. `output.json` を確認し、未閉じタグがどう扱われるか理解
2. `src/compiler/phases/1_parse/state/fragment.rs` のEOFハンドリングを確認
3. Svelte の実装（`svelte/packages/svelte/src/compiler/phases/1-parse/state/fragment.js`）を参考にする

**修正アプローチ**:
- `parse_fragment` または `parse_node` で EOF 検出時に開いているタグを自動的に閉じる
- `element_stack` を追跡し、EOF時に残っている要素を処理

**参考箇所**:
```rust
// src/compiler/phases/1_parse/state/fragment.rs
// parse_fragment または parse_node 関数内
```

**期待される動作**:
- EOF に到達しても、それまでにパースされたノードを返す
- 未閉じタグは暗黙的に閉じられる
- エラーではなく、部分的な AST を生成

---

### 3. loose-unclosed-open-tag (優先度: 中)

**問題**:
```
Parse error: SvelteError { code: "unexpected_eof", message: "Unexpected end of input", span: (170, 170) }
```

**入力**:
```svelte
<div>
	<Comp foo={bar}
</div>
<div>
	<span foo={bar}
</div>
<div foo={bar}
```

**原因**:
- `loose-unclosed-tag` と類似だが、開始タグが完全に閉じていない（`>` がない）
- 例: `<div foo={bar}` で終了（`>` がない）

**修正アプローチ**:
- `loose-unclosed-tag` と同様のアプローチ
- 開始タグのパース中に EOF に到達した場合の処理を追加

**参考箇所**:
```rust
// src/compiler/phases/1_parse/state/element.rs
// read_tag_header または関連関数
```

---

### 4. comment-before-script (優先度: 低)

**問題**:
```
AST mismatch. Actual output written to "_actual.json"
```

**入力**:
```svelte
<!-- comment -->
<script>
</script>
```

**原因**:
- コメントノードの位置や順序が期待と異なる可能性
- フラグメント内のコメントの扱いに微妙な違いがある

**調査手順**:
1. `_actual.json` と `output.json` の差分を確認
   ```bash
   diff <(jq --sort-keys . output.json) <(jq --sort-keys . _actual.json)
   ```
2. コメントノードの `start`/`end`/`data` フィールドを比較
3. フラグメント内のノード順序を確認

**修正アプローチ**:
- 差分の内容に応じて、コメントパース処理を調整
- おそらく小さな位置調整や順序の問題

**参考箇所**:
```rust
// src/compiler/phases/1_parse/state/fragment.rs
// parse_comment 関連
```

---

## 作業の進め方

### 推奨順序:
1. **loose-invalid-expression** - 最も影響範囲が大きく、他のテストにも関連する可能性
2. **comment-before-script** - 比較的単純な AST 差分の修正
3. **loose-unclosed-tag** - EOF ハンドリングの改善
4. **loose-unclosed-open-tag** - 上記と類似

### 各タスクの手順:

#### Phase 1: 調査
```bash
# 入力ファイルを確認
cat svelte/packages/svelte/tests/parser-modern/samples/<test-name>/input.svelte

# 期待される出力を確認
jq . svelte/packages/svelte/tests/parser-modern/samples/<test-name>/output.json

# 実際の出力（あれば）を確認
jq . svelte/packages/svelte/tests/parser-modern/samples/<test-name>/_actual.json

# 差分を確認
diff <(jq --sort-keys . output.json) <(jq --sort-keys . _actual.json)
```

#### Phase 2: Svelte の実装を参照
```bash
# Svelte の対応するコードを確認（git submodule として存在する場合）
# 例: svelte/packages/svelte/src/compiler/phases/1-parse/...
```

#### Phase 3: 実装
1. 該当する Rust ファイルを特定
2. 必要な変更を実装
3. テストを実行して確認
   ```bash
   cargo test test_parser_modern_fixtures -- --nocapture
   ```

#### Phase 4: 検証とコミット
```bash
# フォーマットと lint チェック
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings

# テスト実行
cargo test test_parser_modern_fixtures -- --nocapture

# コミット
git add -A
git commit -m "fix: <問題の説明>"
```

---

## トラブルシューティング

### デバッグ出力の追加
```rust
eprintln!("DEBUG: variable = {:?}", variable);
```

### OXC AST 構造の確認
OXC のドキュメント: https://docs.rs/oxc_ast/latest/oxc_ast/

### Svelte AST の確認
期待される AST 構造を理解するために `output.json` を詳細に読む

---

## 完了条件

- [ ] loose-invalid-expression テスト成功
- [ ] loose-unclosed-tag テスト成功
- [ ] loose-unclosed-open-tag テスト成功
- [ ] comment-before-script テスト成功
- [ ] すべてのテストが `cargo test test_parser_modern_fixtures` で成功
- [ ] Clippy 警告なし
- [ ] コードがフォーマット済み
- [ ] 変更がコミット済み

**最終目標**: Parser Modern Fixtures 22/22 (100%)
