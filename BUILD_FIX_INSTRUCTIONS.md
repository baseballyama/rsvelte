# ビルドエラー修正指示書

## 概要

Phase 2 Analyze の visitor 実装完了後、既存コードベースに2つのビルドエラーが残っています。
これらは私の実装とは無関係の既存コードの問題です。

## エラー1: AnimateDirective の metadata フィールド不足

### エラー内容
```
error[E0063]: missing field `metadata` in initializer of `ast::template::AnimateDirective`
    --> src/compiler/phases/1_parse/state/element.rs:1646:13
     |
1646 |             crate::ast::template::AnimateDirective {
     |             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ missing `metadata`
```

### 原因
`AnimateDirective` 構造体に `metadata` フィールドが追加されたが、パーサーでの初期化時にこのフィールドが設定されていない。

### 修正方法

1. **AnimateDirective 構造体の定義を確認**
   ```bash
   grep -A 10 "pub struct AnimateDirective" src/ast/template.rs
   ```

2. **element.rs:1646 付近を確認**
   ```bash
   sed -n '1640,1655p' src/compiler/phases/1_parse/state/element.rs
   ```

3. **修正手順**
   - `src/compiler/phases/1_parse/state/element.rs` の 1646行目を開く
   - `AnimateDirective` の初期化に `metadata` フィールドを追加
   - 他のディレクティブ（BindDirective, TransitionDirective等）の初期化を参考にする

4. **想定される修正**
   ```rust
   crate::ast::template::AnimateDirective {
       name,
       expression,
       modifiers,
       start,
       end,
       metadata: Default::default(), // または適切な初期値
   }
   ```

### 参考
同様のディレクティブ（BindDirective, TransitionDirective）が metadata をどう初期化しているか確認：
```bash
grep -B 5 -A 10 "BindDirective {" src/compiler/phases/1_parse/state/element.rs
grep -B 5 -A 10 "TransitionDirective {" src/compiler/phases/1_parse/state/element.rs
```

---

## エラー2: ExpressionMetadata の blockers フィールド不足

### エラー内容
```
error[E0063]: missing field `blockers` in initializer of `client::types::ExpressionMetadata`
   --> src/compiler/phases/3_transform/client/visitors/shared/element.rs:196:5
    |
196 |     ExpressionMetadata {
    |     ^^^^^^^^^^^^^^^^^^ missing `blockers`
```

### 原因
Phase 3 Transform の `ExpressionMetadata` 構造体に `blockers` フィールドが追加されたが、
element.rs での初期化時にこのフィールドが設定されていない。

### 修正方法

1. **ExpressionMetadata 構造体の定義を確認**
   ```bash
   grep -A 15 "pub struct ExpressionMetadata" src/compiler/phases/3_transform/client/types.rs
   ```

2. **element.rs:196 付近を確認**
   ```bash
   sed -n '190,205p' src/compiler/phases/3_transform/client/visitors/shared/element.rs
   ```

3. **修正手順**
   - `src/compiler/phases/3_transform/client/visitors/shared/element.rs` の 196行目を開く
   - `ExpressionMetadata` の初期化に `blockers` フィールドを追加
   - 同じファイル内の他の `ExpressionMetadata` 初期化を参考にする

4. **想定される修正**
   ```rust
   ExpressionMetadata {
       has_state: false,
       has_call: false,
       blockers: vec![], // または適切な初期値
       // ... 他のフィールド
   }
   ```

### 参考
同じファイル内の他の ExpressionMetadata 初期化を確認：
```bash
grep -B 2 -A 8 "ExpressionMetadata {" src/compiler/phases/3_transform/client/visitors/shared/element.rs
```

---

## 修正手順の推奨順序

1. **エラー1 を修正** (AnimateDirective)
   - Phase 1 Parse のコード
   - より基本的な構造の修正

2. **エラー2 を修正** (ExpressionMetadata)
   - Phase 3 Transform のコード
   - Phase 1 が正しくないと Phase 3 のテストができない

3. **ビルド確認**
   ```bash
   cargo build
   ```

4. **警告の確認と修正**
   ```bash
   cargo build 2>&1 | grep "warning:"
   ```

---

## 追加調査が必要な場合

### AnimateDirective の metadata フィールドの型を確認
```bash
# AnimateDirective 構造体全体を表示
grep -A 20 "pub struct AnimateDirective" src/ast/template.rs

# metadata フィールドの型を確認
grep "metadata:" src/ast/template.rs | grep -A 1 -B 1 "AnimateDirective"
```

### ExpressionMetadata の blockers フィールドの型を確認
```bash
# ExpressionMetadata 構造体全体を表示
grep -A 25 "pub struct ExpressionMetadata" src/compiler/phases/3_transform/client/types.rs

# blockers フィールドの型を確認
grep "blockers:" src/compiler/phases/3_transform/client/types.rs
```

### 他のディレクティブがどう初期化されているか確認
```bash
# 全ディレクティブの初期化を検索
grep -n "Directive {" src/compiler/phases/1_parse/state/element.rs | head -20
```

---

## 検証方法

修正後、以下のコマンドで検証：

```bash
# ビルド
cargo build

# テスト実行（パーサーテスト）
cargo test test_parser_modern_fixtures -- --nocapture

# 全テスト実行
cargo test

# フォーマットチェック
cargo fmt -- --check

# Clippy チェック
cargo clippy --all-targets --all-features -- -D warnings
```

---

## トラブルシューティング

### metadata フィールドの型が分からない場合
```bash
# AST 定義を確認
rg "pub struct AnimateDirective" -A 15 src/ast/

# 他のディレクティブの metadata を参考にする
rg "metadata.*Directive" src/ast/template.rs
```

### blockers フィールドの型が分からない場合
```bash
# ExpressionMetadata 定義を確認
rg "pub struct ExpressionMetadata" -A 20 src/compiler/phases/3_transform/

# 他の ExpressionMetadata 初期化を参考にする
rg "ExpressionMetadata \{" src/compiler/phases/3_transform/ -A 5
```

### それでも解決しない場合
1. `git log` で最近の変更を確認
2. 関連する PR やコミットメッセージを確認
3. テストコードで使用例を確認

---

## 注意事項

- これらのエラーは Phase 2 Analyze visitor 実装とは無関係
- 既存のコードベースで構造体にフィールドが追加されたが、初期化コードが更新されていない
- 修正は単純なフィールド追加で済むはず（ロジックの変更は不要）
- 修正後は必ずテストを実行して動作を確認すること

---

## 完了チェックリスト

- [ ] AnimateDirective の metadata フィールドを追加
- [ ] ExpressionMetadata の blockers フィールドを追加
- [ ] `cargo build` が成功することを確認
- [ ] 警告がないことを確認
- [ ] `cargo test` が通ることを確認
- [ ] `cargo clippy` が通ることを確認
- [ ] この修正をコミット

---

## 関連ファイル

### 修正が必要なファイル
- `src/compiler/phases/1_parse/state/element.rs` (line 1646)
- `src/compiler/phases/3_transform/client/visitors/shared/element.rs` (line 196)

### 参考にすべきファイル
- `src/ast/template.rs` (AnimateDirective 定義)
- `src/compiler/phases/3_transform/client/types.rs` (ExpressionMetadata 定義)

---

最終更新: 2026-01-10
