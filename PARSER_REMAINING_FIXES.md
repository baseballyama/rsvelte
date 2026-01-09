# パーサーテスト残り3件の修正指示書

現在の状況: **19/22 テスト成功**

残りの3つのテストを修正するための詳細な手順書です。

---

## 1. loose-invalid-expression の修正（優先度: 高）

### 概要

無効な JavaScript 式（`a.`、`x.` など）を含む属性を、ルーズモードで許容するテスト。

### 現在の問題

Expression に `loc` フィールドを追加したが、まだ完全には一致していない可能性がある。

### 確認手順

```bash
cd svelte/packages/svelte/tests/parser-modern/samples/loose-invalid-expression

# 差分を詳細に確認
diff <(jq --sort-keys . output.json) <(jq --sort-keys . _actual.json) | head -100

# 特定の属性の expression を比較
jq '.fragment.nodes[0].attributes[0].value.expression' output.json
jq '.fragment.nodes[0].attributes[0].value.expression' _actual.json
```

### 期待される問題

1. **順序の問題**: JSON オブジェクトのキー順序が異なる
   - `start`, `end`, `loc`, `name`, `type` の順序
   - Svelte は特定の順序で出力している可能性

2. **loc フィールドの内容**: `loc` の `character` フィールドの有無

### 修正手順

#### Step 1: 差分の詳細確認

```bash
cd /Users/baseballyama/git/svelte-compiler-rust
cd svelte/packages/svelte/tests/parser-modern/samples/loose-invalid-expression

# 最初の要素の完全な比較
jq '.fragment.nodes[0]' output.json > expected_node0.json
jq '.fragment.nodes[0]' _actual.json > actual_node0.json
diff -u expected_node0.json actual_node0.json | head -50
```

#### Step 2: キー順序の修正（必要な場合）

もしキー順序が問題なら、`get_loose_identifier` 関数でキーの挿入順序を調整：

**ファイル**: `src/compiler/phases/1_parse/read/expression.rs`

```rust
fn get_loose_identifier(...) -> Option<Expression> {
    if let Some(end) = find_matching_bracket(template, start, opening_token) {
        let mut obj = Map::new();

        // Svelteと同じ順序で挿入
        obj.insert("type".to_string(), Value::String("Identifier".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        // loc は start/end の後
        let loc = super::super::estree_compat::utils::create_loc(start, end, line_offsets);
        obj.insert("loc".to_string(), loc);

        // name は最後
        obj.insert("name".to_string(), Value::String("".to_string()));

        return Some(Expression::Value(Value::Object(obj)));
    }
    None
}
```

#### Step 3: create_loc_with_character を使用

**重要**: 期待される出力には `character` フィールドが含まれています！

`create_loc` の代わりに `create_loc_with_character` を使用する必要があります。

**ファイル**: `src/compiler/phases/1_parse/read/expression.rs`

```rust
fn get_loose_identifier(...) -> Option<Expression> {
    if let Some(end) = find_matching_bracket(template, start, opening_token) {
        let mut obj = Map::new();

        obj.insert("type".to_string(), Value::String("Identifier".to_string()));
        obj.insert("name".to_string(), Value::String("".to_string()));
        obj.insert("start".to_string(), Value::Number((start as i64).into()));
        obj.insert("end".to_string(), Value::Number((end as i64).into()));

        // create_loc_with_character を使用（character フィールド付き）
        let loc = super::super::estree_compat::utils::create_loc_with_character(
            start,
            end,
            line_offsets
        );
        obj.insert("loc".to_string(), loc);

        return Some(Expression::Value(Value::Object(obj)));
    }
    None
}
```

#### Step 4: テストと検証

```bash
cargo test test_parser_modern_fixtures -- --nocapture | grep "loose-invalid-expression"

# 成功したら次へ、失敗したら差分を再確認
cd svelte/packages/svelte/tests/parser-modern/samples/loose-invalid-expression
diff <(jq . output.json) <(jq . _actual.json) | less
```

---

## 2. loose-invalid-block の修正（優先度: 中）

### 概要

**空の式**を含むブロックタグのテスト。

**入力ファイル内容**:
```svelte
{#if }
{:else if }
{:else }
{/if}

{#each }
{/each}

{#snippet }
{/snippet}

{#snippet foo}
{/snippet}
```

### 確認手順

```bash
cd svelte/packages/svelte/tests/parser-modern/samples/loose-invalid-block

# 差分を確認
diff <(jq --sort-keys . output.json) <(jq --sort-keys . _actual.json) | head -100
```

### 期待される問題

1. **空の式の処理**: `{#if }`, `{#each }` など、式が空の場合の loose identifier
2. **Expression の loc フィールド**: loose-invalid-expression と同じ問題（`character` フィールド）

### 修正手順

#### Step 1: 入力ファイルと差分の確認

```bash
cd /Users/baseballyama/git/svelte-compiler-rust
cd svelte/packages/svelte/tests/parser-modern/samples/loose-invalid-block

# どのようなブロックがあるか確認
cat input.svelte

# 最初のブロックノードを比較
jq '.fragment.nodes | map(select(.type | contains("Block"))) | .[0]' output.json > expected_block0.json
jq '.fragment.nodes | map(select(.type | contains("Block"))) | .[0]' _actual.json > actual_block0.json
diff -u expected_block0.json actual_block0.json
```

#### Step 2: ブロックタグの式パースを確認

ブロックタグ（`{#if}`, `{#each}`, `{#await}` など）の式パースは `src/compiler/phases/1_parse/state/tag.rs` で実装されています。

**確認ポイント**:
- `parse_if_block`, `parse_each_block`, `parse_await_block` で `parse_js_expression` を呼ぶ際に、同じ `line_offsets` を渡しているか
- loose モードが有効になっているか

**ファイル**: `src/compiler/phases/1_parse/state/tag.rs`

```bash
grep -n "parse_js_expression" src/compiler/phases/1_parse/state/tag.rs | head -20
```

各箇所で line_offsets が正しく渡されていることを確認。

#### Step 3: 修正実装（必要な場合）

もし loc フィールドが欠けている場合、tag.rs 内の式パース呼び出しを確認：

```rust
// 例: parse_if_block 内
let expression = self.parse_js_expression(
    expr_content.trim(),
    expr_start,
);

// このとき、parse_js_expression が内部で line_offsets を使っているか確認
```

#### Step 4: テスト

```bash
cargo test test_parser_modern_fixtures -- --nocapture | grep "loose-invalid-block"
```

---

## 3. comment-before-script の修正（優先度: 低〜中）

### 概要

TypeScript の型アノテーション（`let count: number;`）をパースするテスト。

### 現在の問題

TypeScript 型アノテーションのサポートが未実装。

```typescript
let count: number;
```

期待される出力：
```json
{
  "type": "Identifier",
  "name": "count",
  "typeAnnotation": {
    "type": "TSTypeAnnotation",
    "typeAnnotation": {
      "type": "TSNumberKeyword"
    }
  }
}
```

実際の出力：
```json
{
  "type": "Identifier",
  "name": "count"
}
```

### 修正手順

このテストは **大規模な実装が必要** です。OXC パーサーからの TypeScript AST 変換を実装する必要があります。

#### Step 1: 現在の状況確認

```bash
cd svelte/packages/svelte/tests/parser-modern/samples/comment-before-script

# 期待される構造を確認
jq '.instance.content.body[0].declarations[0].id' output.json
```

#### Step 2: 必要な実装の特定

**ファイル**: `src/compiler/phases/1_parse/estree_compat/pattern.rs`

現在は TODO で空実装：

```rust
pub fn convert_binding_pattern(
    _pattern: &oxc_ast::ast::BindingPattern,
    _source: &str,
    _offset: usize,
    _line_offsets: &[usize],
) -> Value {
    // TODO: 実装予定
    Value::Null
}
```

#### Step 3: 実装方針

##### 3.1 BindingPattern の変換実装

```rust
pub fn convert_binding_pattern(
    pattern: &oxc_ast::ast::BindingPattern,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::BindingPatternKind;

    match &pattern.kind {
        BindingPatternKind::BindingIdentifier(ident) => {
            // Identifier への変換
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("Identifier".to_string()));

            let start = ident.span.start as usize + offset;
            let end = ident.span.end as usize + offset;

            obj.insert("start".to_string(), Value::Number(start.into()));
            obj.insert("end".to_string(), Value::Number(end.into()));
            obj.insert("name".to_string(), Value::String(ident.name.to_string()));

            // loc フィールド
            let loc = crate::compiler::phases::phase1_parse::estree_compat::utils::create_loc(
                start, end, line_offsets
            );
            obj.insert("loc".to_string(), loc);

            // TypeScript type annotation があれば追加
            if let Some(type_annotation) = &pattern.type_annotation {
                let ts_type = convert_ts_type_annotation(
                    type_annotation,
                    source,
                    offset,
                    line_offsets,
                );
                obj.insert("typeAnnotation".to_string(), ts_type);
            }

            Value::Object(obj)
        }
        // 他のパターン（ArrayPattern, ObjectPattern など）も実装
        _ => Value::Null,
    }
}
```

##### 3.2 TypeScript 型アノテーションの変換

**ファイル**: `src/compiler/phases/1_parse/estree_compat/typescript.rs`

```rust
use oxc_ast::ast::{TSTypeAnnotation, TSType};
use serde_json::{Map, Value};

pub fn convert_ts_type_annotation(
    type_annotation: &TSTypeAnnotation,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    let mut obj = Map::new();
    obj.insert("type".to_string(), Value::String("TSTypeAnnotation".to_string()));

    let start = type_annotation.span.start as usize + offset;
    let end = type_annotation.span.end as usize + offset;

    obj.insert("start".to_string(), Value::Number(start.into()));
    obj.insert("end".to_string(), Value::Number(end.into()));

    let loc = crate::compiler::phases::phase1_parse::estree_compat::utils::create_loc(
        start, end, line_offsets
    );
    obj.insert("loc".to_string(), loc);

    // type_annotation フィールド（実際の型）
    let type_value = convert_ts_type(&type_annotation.type_annotation, source, offset, line_offsets);
    obj.insert("typeAnnotation".to_string(), type_value);

    Value::Object(obj)
}

pub fn convert_ts_type(
    ts_type: &TSType,
    source: &str,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    use oxc_ast::ast::TSType;

    match ts_type {
        TSType::TSNumberKeyword(keyword) => {
            let mut obj = Map::new();
            obj.insert("type".to_string(), Value::String("TSNumberKeyword".to_string()));

            let start = keyword.span.start as usize + offset;
            let end = keyword.span.end as usize + offset;

            obj.insert("start".to_string(), Value::Number(start.into()));
            obj.insert("end".to_string(), Value::Number(end.into()));

            let loc = crate::compiler::phases::phase1_parse::estree_compat::utils::create_loc(
                start, end, line_offsets
            );
            obj.insert("loc".to_string(), loc);

            Value::Object(obj)
        }
        TSType::TSStringKeyword(keyword) => {
            // 同様に実装
            todo!()
        }
        TSType::TSBooleanKeyword(keyword) => {
            // 同様に実装
            todo!()
        }
        // 他の型も必要に応じて実装
        _ => Value::Null,
    }
}
```

##### 3.3 Statement の変換でパターンを使用

**ファイル**: `src/compiler/phases/1_parse/estree_compat/statement.rs`

Statement 変換時に convert_binding_pattern を呼び出すように修正。

#### Step 4: 実装の優先順位

TypeScript サポートは **大規模な実装** であり、以下の順序で進めることを推奨：

1. **最小限の実装**: `TSNumberKeyword`, `TSStringKeyword`, `TSBooleanKeyword` のみサポート
2. **BindingIdentifier の変換**: 変数宣言での型アノテーション
3. **テストで確認**: comment-before-script が成功するか
4. **段階的に拡張**: 他の TypeScript 型（Union, Intersection, Generic など）

#### Step 5: テスト

```bash
cargo test test_parser_modern_fixtures -- --nocapture | grep "comment-before-script"

# 成功したら詳細確認
cd svelte/packages/svelte/tests/parser-modern/samples/comment-before-script
diff <(jq . output.json) <(jq . _actual.json)
```

---

## 実装の推奨順序

1. **loose-invalid-expression** (30分〜1時間)
   - loc フィールドの修正のみ
   - 比較的簡単

2. **loose-invalid-block** (30分〜1時間)
   - loose-invalid-expression と同じ修正
   - ブロック内の式に同じ問題がある可能性

3. **comment-before-script** (3〜5時間)
   - TypeScript サポートの実装が必要
   - より大規模な作業

---

## デバッグのヒント

### JSON 差分の見やすい表示

```bash
# カラー差分
diff -u <(jq --sort-keys . output.json) <(jq --sort-keys . _actual.json) | colordiff | less -R

# 特定のパスのみ比較
jq '.fragment.nodes[0].attributes[0]' output.json > expected_attr.json
jq '.fragment.nodes[0].attributes[0]' _actual.json > actual_attr.json
diff -u expected_attr.json actual_attr.json
```

### Svelte のパース結果を直接確認

```bash
cd svelte/packages/svelte/tests/parser-modern/samples/[テスト名]
node ../../../../../../scripts/parse-with-svelte.mjs input.svelte > svelte_output.json
jq . svelte_output.json | less
```

### デバッグ出力の追加

```rust
// Rust コードにデバッグ出力
eprintln!("DEBUG: loose identifier - start={}, end={}", start, end);
eprintln!("DEBUG: loc = {:?}", loc);
```

---

## 完了条件

- [ ] loose-invalid-expression テスト成功
- [ ] loose-invalid-block テスト成功
- [ ] comment-before-script テスト成功
- [ ] 全テストが `cargo test test_parser_modern_fixtures` で成功
- [ ] Clippy 警告なし
- [ ] コードがフォーマット済み
- [ ] すべての変更がコミット済み

**最終目標: Parser Modern Fixtures 22/22 (100%)**

---

## 参考資料

### Svelte の対応ファイル

- **Expression**: `svelte/packages/svelte/src/compiler/phases/1-parse/read/expression.js`
- **Pattern**: `svelte/packages/svelte/src/compiler/phases/1-parse/acorn.js` (comment handling)
- **TypeScript**: Svelte は Acorn + acorn-typescript プラグインを使用

### Rust 実装の対応ファイル

- `src/compiler/phases/1_parse/read/expression.rs` - 式パース
- `src/compiler/phases/1_parse/estree_compat/pattern.rs` - パターン変換（変数宣言など）
- `src/compiler/phases/1_parse/estree_compat/typescript.rs` - TypeScript 変換
- `src/compiler/phases/1_parse/estree_compat/utils.rs` - 共通ユーティリティ

### OXC ドキュメント

- OXC AST: https://github.com/oxc-project/oxc
- TypeScript AST 定義: `oxc_ast::ast::TSType`

---

## クイックスタート: 最速で22/22を達成する手順

### 1. loose-invalid-expression を修正（15分）

```bash
cd /Users/baseballyama/git/svelte-compiler-rust

# expression.rs を編集
nano src/compiler/phases/1_parse/read/expression.rs
```

**変更箇所**: 149行目付近

```rust
// 変更前:
let loc = super::super::estree_compat::utils::create_loc(start, end, line_offsets);

// 変更後:
let loc = super::super::estree_compat::utils::create_loc_with_character(start, end, line_offsets);
```

```bash
# テスト
cargo test test_parser_modern_fixtures -- --nocapture | grep "loose-invalid"

# 成功したらコミット
git add -A && git commit -m "fix: add character field to loose identifier loc"
```

### 2. loose-invalid-block を確認（5分）

Step 1 の修正で loose-invalid-block も自動的に修正される可能性が高い。

```bash
cargo test test_parser_modern_fixtures -- --nocapture | grep "Passed:"
# 21/22 になっていれば成功
```

### 3. comment-before-script はスキップまたは後回し

TypeScript サポートは大規模実装なので、以下のどちらかを選択：

**オプション A: スキップして 21/22 で満足**
- 21/22 (95.5%) でも十分な進捗

**オプション B: 最小限の実装（2〜3時間）**
- `TSNumberKeyword` のみ実装
- `BindingPattern` の基本サポート

---

## まとめ

### 推定作業時間

| テスト | 難易度 | 推定時間 | 説明 |
|--------|--------|----------|------|
| loose-invalid-expression | ⭐️ | 15分 | 1行の修正 |
| loose-invalid-block | ⭐️ | 5分 | 上記と同じ修正で解決 |
| comment-before-script | ⭐️⭐️⭐️⭐️⭐️ | 2〜5時間 | TypeScript サポート実装 |

### 最短ルート（20分で21/22達成）

1. `create_loc` → `create_loc_with_character` に変更
2. テスト実行
3. コミット

完了！

### フルサポートルート（3〜6時間で22/22達成）

1. 最短ルートを実行（20分）
2. TypeScript 基本型の実装（2〜3時間）
3. BindingPattern の実装（1〜2時間）
4. テストとデバッグ（1時間）

完了！

---

## トラブルシューティング

### Q: create_loc_with_character が見つからない

A: `src/compiler/phases/1_parse/estree_compat/utils.rs` に実装されています。以下を確認：

```bash
grep -n "create_loc_with_character" src/compiler/phases/1_parse/estree_compat/utils.rs
```

### Q: 修正後もテストが失敗する

A: 差分を詳しく確認：

```bash
cd svelte/packages/svelte/tests/parser-modern/samples/loose-invalid-expression
diff <(jq . output.json) <(jq . _actual.json) | head -50
```

キーの順序が問題なら、Map への挿入順序を調整。

### Q: TypeScript サポートをどこから始めればいい？

A: 以下の順序で実装：

1. `convert_ts_type` で `TSNumberKeyword` のみ実装
2. `convert_ts_type_annotation` を実装
3. `convert_binding_pattern` で typeAnnotation を追加
4. テストで確認
5. 他の型（String, Boolean など）を追加

---

## 成功の確認

最終的に以下のコマンドで全テスト成功を確認：

```bash
cargo test test_parser_modern_fixtures -- --nocapture

# 期待される出力:
# Passed: 22/22
# Failed: 0/22
```

おめでとうございます！🎉

---

## 次のステップ

Parser Modern Fixtures 22/22 達成後：

1. **Parser Legacy Fixtures**: すでに 82/82 (100%) 達成済み ✅
2. **Compiler Snapshot Tests**: 16/17 (94.1%)
3. **CSS Tests**: 110/177 (62.1%)
4. **Validator Tests**: 65/312 (20.8%)

次は CSS scoping の改善に注力することを推奨します。

