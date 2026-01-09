# TypeScript型注釈の修正指示書

## 📋 概要

OXC v0.107マイグレーション後、TypeScript型注釈が正しくパースされていません。
これにより Parser Modern のテストが 20/22 (90.9%) から 13/22 (59.1%) に低下しています。

## 🐛 問題の詳細

### 症状

入力：
```svelte
{#snippet foo(msg: string)}
  <p>{msg}</p>
{/snippet}
```

期待される出力（`msg`パラメータ）：
```json
{
  "type": "Identifier",
  "name": "msg",
  "start": 43,
  "end": 54,
  "typeAnnotation": {
    "type": "TSTypeAnnotation",
    "start": 46,
    "end": 54,
    "typeAnnotation": {
      "type": "TSStringKeyword",
      "start": 48,
      "end": 54
    }
  }
}
```

実際の出力：
```json
{
  "type": "Identifier",
  "name": "msg",
  "start": 43,
  "end": 46,
  // typeAnnotation が完全に欠落
}
```

### 影響を受けるテスト

**Parser Modern (9件失敗)**:
- `snippets` - snippet パラメータの型注釈
- `options` - svelte:options の runes 属性値エラー
- `css-pseudo-classes` - CSS関連
- その他6件

**Parser Legacy (7件失敗)**:
- `generic-snippets` - ジェネリック型パラメータ
- その他6件（loose mode関連）

## 🔍 根本原因

OXC v0.56 から v0.107 への移行時、型注釈のアクセス方法が変更されました。

**問題のコード**: `src/compiler/phases/1_parse/read/expression.rs:359-376`

```rust
fn convert_formal_parameter(
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    use oxc_ast::ast::BindingPattern;

    match &param.pattern {
        BindingPattern::BindingIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let end = adjusted_offset + id.span.end as usize;
            let name = id.name.as_str();

            // TODO: OXC v0.107 moved type annotations to a different location
            // Need to investigate where type annotations are now stored
            create_identifier(name, start, end, line_offsets)
        }
        // ...
    }
}
```

## 🛠️ 修正手順

### ステップ1: OXC v0.107の型注釈の場所を特定

OXC v0.107では、`BindingPattern`の構造が変更されています：

**v0.56** (旧構造):
```rust
struct BindingPattern {
    kind: BindingPatternKind,
    type_annotation: Option<Box<TSTypeAnnotation>>, // ここにあった
    optional: bool,
}

enum BindingPatternKind {
    BindingIdentifier(Box<BindingIdentifier>),
    // ...
}
```

**v0.107** (新構造):
```rust
enum BindingPattern {
    BindingIdentifier(Box<BindingIdentifier>),
    ObjectPattern(Box<ObjectPattern>),
    ArrayPattern(Box<ArrayPattern>),
    AssignmentPattern(Box<AssignmentPattern>),
    RestElement(Box<RestElement>),
}

// 型注釈は各variant内に移動した可能性がある
```

**調査方法**:

1. OXC v0.107のドキュメントを確認:
   ```bash
   # Cargo.tomlで使用中のバージョンを確認
   grep "oxc" Cargo.toml

   # ドキュメントを開く
   open https://docs.rs/oxc_ast/0.107.0/oxc_ast/
   ```

2. `BindingIdentifier`構造体を確認:
   ```rust
   // おそらくここに type_annotation フィールドがある
   pub struct BindingIdentifier {
       pub span: Span,
       pub name: Atom,
       pub type_annotation: Option<Box<TSTypeAnnotation>>, // ← ここ？
   }
   ```

3. または`FormalParameter`自体に型注釈がある可能性:
   ```rust
   pub struct FormalParameter {
       pub span: Span,
       pub pattern: BindingPattern,
       pub type_annotation: Option<Box<TSTypeAnnotation>>, // ← ここ？
       // ...
   }
   ```

### ステップ2: コードを修正

**オプションA**: `BindingIdentifier`に型注釈がある場合

```rust
fn convert_formal_parameter(
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    use oxc_ast::ast::BindingPattern;

    match &param.pattern {
        BindingPattern::BindingIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let name = id.name.as_str();

            // 型注釈がある場合、その終了位置まで含める
            if let Some(type_ann) = &id.type_annotation {
                let end = adjusted_offset + type_ann.span.end as usize;

                let mut obj = Map::new();
                obj.insert("type".to_string(), Value::String("Identifier".to_string()));
                obj.insert("start".to_string(), Value::Number((start as i64).into()));
                obj.insert("end".to_string(), Value::Number((end as i64).into()));
                obj.insert("loc".to_string(), create_loc(start, end, line_offsets));
                obj.insert("name".to_string(), Value::String(name.to_string()));

                // 型注釈を変換
                let type_ann_obj = convert_type_annotation_adjusted(type_ann, adjusted_offset, line_offsets);
                obj.insert("typeAnnotation".to_string(), type_ann_obj);

                return Expression::Value(Value::Object(obj));
            }

            // 型注釈がない場合
            let end = adjusted_offset + id.span.end as usize;
            create_identifier(name, start, end, line_offsets)
        }
        // 他のパターンも同様に処理
        // ...
    }
}
```

**オプションB**: `FormalParameter`に型注釈がある場合

```rust
fn convert_formal_parameter(
    param: &oxc_ast::ast::FormalParameter,
    adjusted_offset: usize,
    line_offsets: &[usize],
) -> Expression {
    use oxc_ast::ast::BindingPattern;

    match &param.pattern {
        BindingPattern::BindingIdentifier(id) => {
            let start = adjusted_offset + id.span.start as usize;
            let name = id.name.as_str();

            // FormalParameter の型注釈を確認
            if let Some(type_ann) = &param.type_annotation {
                let end = adjusted_offset + type_ann.span.end as usize;
                // 上記と同様の処理
                // ...
            }

            let end = adjusted_offset + id.span.end as usize;
            create_identifier(name, start, end, line_offsets)
        }
        // ...
    }
}
```

### ステップ3: 既存のヘルパー関数を使用

`convert_type_annotation_adjusted`関数は既に実装されています（405行目）:

```rust
fn convert_type_annotation_adjusted(
    type_ann: &oxc_ast::ast::TSTypeAnnotation,
    offset: usize,
    line_offsets: &[usize],
) -> Value {
    // ...
}
```

この関数を使って型注釈をJSONに変換します。

### ステップ4: デバッグヘルパーを追加（推奨）

```rust
// デバッグ用: 構造体のフィールドを確認
fn debug_formal_parameter(param: &oxc_ast::ast::FormalParameter) {
    eprintln!("=== FormalParameter Debug ===");
    eprintln!("Pattern: {:?}", param.pattern);

    match &param.pattern {
        BindingPattern::BindingIdentifier(id) => {
            eprintln!("BindingIdentifier name: {}", id.name);
            eprintln!("BindingIdentifier fields: {:#?}", id);
        }
        _ => {}
    }

    eprintln!("FormalParameter fields: {:#?}", param);
}
```

## 🧪 テスト方法

### 最小限のテストケース

```rust
// tests/test_type_annotation.rs
#[test]
fn test_snippet_with_type_annotation() {
    use svelte_compiler_rust::{parse, ParseOptions};

    let input = r#"
{#snippet foo(msg: string)}
    <p>{msg}</p>
{/snippet}
"#;

    let result = parse(input, ParseOptions {
        modern: true,
        ..Default::default()
    }).unwrap();

    // AST をJSON化
    let json = serde_json::to_value(&result).unwrap();

    // snippet の parameters[0] に typeAnnotation があることを確認
    let snippet = &json["fragment"]["nodes"][1];
    assert_eq!(snippet["type"], "SnippetBlock");

    let param = &snippet["parameters"][0];
    assert_eq!(param["name"], "msg");
    assert!(param.get("typeAnnotation").is_some(), "typeAnnotation should exist");

    let type_ann = &param["typeAnnotation"];
    assert_eq!(type_ann["type"], "TSTypeAnnotation");
    assert_eq!(type_ann["typeAnnotation"]["type"], "TSStringKeyword");
}
```

実行:
```bash
cargo test test_snippet_with_type_annotation -- --nocapture
```

### 完全なテストスイート

```bash
# Parser Modern のテストを実行
cargo test --test parser_fixtures test_parser_modern_fixtures -- --nocapture

# 特定のテストケースのみ
cargo test --test parser_fixtures -- snippets --nocapture
```

期待される結果:
```
=== Parser Modern Fixtures ===
Passed: 20/22
Failed: 2/22
```

## 📝 チェックリスト

修正作業のチェックリスト:

- [ ] OXC v0.107のドキュメントで`BindingIdentifier`の構造を確認
- [ ] 型注釈がどのフィールドに格納されているか特定（`id.type_annotation`または`param.type_annotation`）
- [ ] `convert_formal_parameter`関数を修正
- [ ] デバッグ出力を追加して実際の構造を確認
- [ ] 最小限のテストケースで動作確認
- [ ] Parser Modern のテストを実行（目標: 20/22通過）
- [ ] Parser Legacy のテストも確認（型注釈関連の失敗が解消されているか）
- [ ] デバッグコードを削除
- [ ] `cargo fmt && cargo clippy`を実行
- [ ] コミットしてプッシュ

## 🔗 参考情報

### ファイルの場所

- **修正対象**: `src/compiler/phases/1_parse/read/expression.rs:359-376`
- **ヘルパー関数**: `src/compiler/phases/1_parse/read/expression.rs:405-430`
  - `convert_type_annotation_adjusted`
  - `convert_ts_type_adjusted`
  - `convert_ts_type_name_adjusted`
- **テスト**: `tests/parser_fixtures.rs`
- **テストケース**:
  - `svelte/packages/svelte/tests/parser-modern/samples/snippets/`
  - `svelte/packages/svelte/tests/parser-legacy/samples/generic-snippets/`

### OXC ドキュメント

- OXC v0.107 AST: https://docs.rs/oxc_ast/0.107.0/oxc_ast/
- BindingPattern: https://docs.rs/oxc_ast/0.107.0/oxc_ast/ast/enum.BindingPattern.html
- BindingIdentifier: https://docs.rs/oxc_ast/0.107.0/oxc_ast/ast/struct.BindingIdentifier.html
- FormalParameter: https://docs.rs/oxc_ast/0.107.0/oxc_ast/ast/struct.FormalParameter.html
- TSTypeAnnotation: https://docs.rs/oxc_ast/0.107.0/oxc_ast/ast/struct.TSTypeAnnotation.html

### 元の実装（OXC v0.56）

バックアップファイルに旧実装があります:
```bash
# 旧実装を確認（参考用）
less src/compiler/phases/1_parse/read/expression.rs.backup
# 359行目付近を見る
```

### デバッグ方法

```bash
# パース結果をJSONで出力
cargo run -- parse svelte/packages/svelte/tests/parser-modern/samples/snippets/input.svelte --modern > /tmp/output.json

# 期待される出力と比較
diff -u svelte/packages/svelte/tests/parser-modern/samples/snippets/output.json /tmp/output.json | head -50
```

## 💡 追加のヒント

1. **段階的に進める**: まず`BindingIdentifier`のフィールドを`eprintln!`でデバッグ出力し、構造を確認してから修正する

2. **既存の実装を参考にする**: `convert_type_annotation_adjusted`は既に実装済みなので、これを呼び出すだけでOK

3. **エラーハンドリング**: 型注釈がない場合の処理も忘れずに（既存のコードと同じ）

4. **位置情報**: `end`位置は型注釈を含む場合は`type_ann.span.end`、含まない場合は`id.span.end`

5. **他のパターン**: `ObjectPattern`、`ArrayPattern`なども型注釈を持つ可能性があるが、まずは`BindingIdentifier`から

## ❓ 質問があれば

- Slack/Discord: @[あなたの連絡先]
- GitHub Issue: このリポジトリにissueを立てる
- コミット: ブランチ名は`fix/oxc-v0.107-type-annotations`推奨

---

**最終更新**: 2026-01-09
**作成者**: Claude Code
