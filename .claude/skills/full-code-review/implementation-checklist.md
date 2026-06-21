# 実装レビューチェックリスト（rsvelte 版）

`full-code-review` の Phase 4 で各 Agent が参照する実装レベルのレビュー観点。
すべての PR は、変更内容に応じた適切なテストカバレッジを持つ必要がある。

- [公式 Svelte 実装との整合性（最優先）](#公式-svelte-実装との整合性最優先)
- [メモリ安全性とパニック](#メモリ安全性とパニック)
- [パフォーマンス観点](#パフォーマンス観点)
- [エラーハンドリングと Result 型](#エラーハンドリングと-result-型)
- [ライフタイムと借用](#ライフタイムと借用)
- [Rust イディオム / clippy](#rust-イディオム--clippy)
- [テストカバレッジ](#テストカバレッジ)
- [DRY 原則の遵守](#dry-原則の遵守)
- [命名規則](#命名規則)
- [コメント方針](#コメント方針)
- [Cargo / 依存関係](#cargo--依存関係)
- [`unsafe` の取り扱い](#unsafe-の取り扱い)
- [NAPI 境界](#napi-境界)
- [PR の作成ルール](#pr-の作成ルール)
- [レビュー時のチェックリスト](#レビュー時のチェックリスト)

**レビュー優先順位**: 公式整合性 > メモリ安全性 > パフォーマンス > 正確性 > 可読性

---

## 公式 Svelte 実装との整合性（最優先）

rsvelte は公式 Svelte コンパイラ（`svelte/packages/svelte/src/compiler/`）の Rust ポートである。
**100% テスト互換性が rsvelte の最重要目標** であり、これを損なう変更は受け入れられない。

### 対応関係

| Rust 側                                   | 公式 JS 側                                                       |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `src/compiler/phases/1_parse/`            | `svelte/packages/svelte/src/compiler/phases/1-parse/`            |
| `src/compiler/phases/2_analyze/`          | `svelte/packages/svelte/src/compiler/phases/2-analyze/`          |
| `src/compiler/phases/3_transform/client/` | `svelte/packages/svelte/src/compiler/phases/3-transform/client/` |
| `src/compiler/phases/3_transform/server/` | `svelte/packages/svelte/src/compiler/phases/3-transform/server/` |
| `src/compiler/phases/3_transform/css/`    | `svelte/packages/svelte/src/compiler/phases/3-transform/css/`    |
| `src/error/`                              | `svelte/packages/svelte/src/compiler/{errors,warnings}.js`       |
| `src/ast/`                                | `svelte/packages/svelte/src/compiler/types/`                     |

### 整合性チェック項目

- **アルゴリズムの一致**: 公式実装の判定順序・分岐条件・エッジケース処理と一致しているか
- **出力の一致**: 同じ Svelte ソースを入力にしたとき、生成される JS / CSS のバイト列が公式と一致するか（fixture テストで確認）
- **エラーコード / メッセージ**: エラーコード（`invalid-binding-target` 等）とメッセージ文言が公式と一致しているか
- **命名のミラー**: 関数名・引数名・フィールド名・モジュール構造が公式の翻字（snake_case 化）になっているか
- **新機能の同期**: 公式 Svelte に新しい構文・コンパイラオプション・警告が追加されたら、rsvelte 側も対応しているか
- **意図的逸脱の根拠**: 公式と異なる実装にする場合、その理由がコメントまたは commit message に明記されているか

### 公式と差分が発生しがちなパターン

| パターン                                 | 検出方法                                                           | 対応                                             |
| ---------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| 公式が利用する JS API を Rust 標準で代替 | `String.prototype.*` を `str` メソッドで置換した箇所               | 挙動の差異（特に Unicode 境界）を確認            |
| 正規表現の差異                           | `regex` クレート vs JS RegExp                                      | グリーディ性、後読み、Unicode フラグの違いを確認 |
| Number 表現                              | JS の Number（IEEE 754）vs Rust の i32/f64                         | 大きな数値・小数・NaN の扱いを比較               |
| シリアライズ順序                         | HashMap の挙動（順序非保証）                                       | `IndexMap` / `BTreeMap` で公式の順序を再現       |
| パニックポイント                         | 公式は throw、rsvelte で `unwrap()` を使うと panic で fixture 失敗 | `Result` で伝播し公式と同じエラーを返す          |

```rust
// ❌ 公式と整合しない: HashMap は順序非保証なので fixture と差分が出る
let mut attrs: HashMap<&str, Value> = HashMap::new();

// ✅ 公式と同じ順序を保つ
use indexmap::IndexMap;
let mut attrs: IndexMap<&str, Value> = IndexMap::new();
```

### 公式実装の参照方法

```bash
# 対応する公式実装を読む
cat svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Element.js

# サブモジュールが指す公式版を確認
cd svelte && git rev-parse HEAD && git describe --tags --abbrev=0

# 互換性レポート（変更前後で fixture pass 数を比較）
pnpm run compatibility-report
```

---

## メモリ安全性とパニック

production コードパスで panic を引き起こす API は、コンパイラへの入力次第で簡単に DoS につながる。レビューでは production コード（`src/` 配下、tests 以外）に以下が含まれていないか確認する:

| API                  | レビュー基準                                                                   |
| -------------------- | ------------------------------------------------------------------------------ |
| `unwrap()`           | **原則禁止**。`Result` で伝播 or `expect("WHY")` で root-cause を documents 化 |
| `expect("...")`      | 失敗が論理的に不可能な場合のみ許容。メッセージで invariant を明示              |
| `panic!()`           | 内部 invariant 違反の自己診断のみ。ユーザー入力起因では使わない                |
| `todo!()`            | コミット前に解消必須。production には残さない                                  |
| `unimplemented!()`   | 同上                                                                           |
| `unreachable!()`     | 列挙の網羅性で本当に unreachable な場合のみ                                    |
| `[index]` / `arr[i]` | 範囲チェックがあるか確認。なければ `get(i)` を使う                             |
| `slice[a..b]`        | `a <= b <= len` が保証されているか確認                                         |

```rust
// ❌ 入力起因で panic する可能性
let span = self.spans[node_id]; // node_id が範囲外なら panic

// ✅ Result で伝播
let span = self.spans.get(node_id).ok_or(CompileError::MissingSpan(node_id))?;

// ✅ 不可能なら expect で意図を残す
let span = self.spans.get(node_id).expect("node_id is allocated by us, must exist");
```

### `unwrap()` が許容される例外

- **テストコード**（`#[cfg(test)]` 内、`tests/` 配下、`benches/` 配下）
- **ロックの取得**: `Mutex::lock().unwrap()` は poisoning 時の panic として一般的
- **不可能性が型で証明されている**場合（例: `Some` を直前に `if let Some(_) = ...` で確認した直後）

それ以外の `unwrap()` は理由のコメントを要求すること。

---

## パフォーマンス観点

rsvelte の目標は **公式 JS コンパイラの 100x 速** である（`/perf` スキル参照）。
hot path（パース / トラバーサル / コード生成）では以下を厳しくチェックする。

### hot path での割り当て検出

```rust
// ❌ ループ内で String を割り当てる（hot path で致命的）
for node in nodes {
    let key = format!("attr_{}", node.name); // 毎回 heap 割り当て
    map.insert(key, node);
}

// ✅ 借用 or 事前確保したバッファに書き込む
let mut key_buf = String::with_capacity(64);
for node in nodes {
    key_buf.clear();
    use std::fmt::Write;
    write!(key_buf, "attr_{}", node.name).unwrap();
    map.insert(key_buf.as_str(), node); // 借用で参照するか
}

// ✅ もしくは Cow / 静的文字列で済む設計に変える
```

### 不要な clone の検出

```rust
// ❌ 大きな AST ノードを clone する（コンパイラ全体が遅くなる）
fn process(node: &Element) -> Element {
    let cloned = node.clone(); // Element は子ノード Vec を持つので深い clone
    transform(cloned)
}

// ✅ 借用で渡す
fn process(node: &Element) -> &Element {
    transform(node)
}

// ✅ 必要なら Cow で「変更時のみ clone」
fn process(node: &Element) -> Cow<'_, Element> {
    if needs_modification(node) {
        Cow::Owned(modified(node))
    } else {
        Cow::Borrowed(node)
    }
}
```

### `serde_json::Value` の使用は退行

OXC 流の typed AST に向かう設計から逆行する。**新規導入は原則禁止**:

```bash
# 既存の使用箇所を確認
rg "serde_json::Value" src/ --type rust -l
rg "json!\(" src/ --type rust -l
```

新たに `serde_json::Value` を hot path に導入する PR は Critical 指摘とする。

### コレクション選択

| 用途                         | 推奨                                       | 理由                                 |
| ---------------------------- | ------------------------------------------ | ------------------------------------ |
| 順序非保証 HashMap           | `FxHashMap`                                | デフォルト Hasher (SipHash) より速い |
| 順序保持 Map                 | `IndexMap` / `BTreeMap`                    | fixture 出力の安定化                 |
| 小さい Vec                   | `SmallVec<[T; N]>`                         | スタック割り当て                     |
| 大きい所有 String            | `String`                                   | -                                    |
| 短い所有 String              | `CompactString`                            | inline string                        |
| ソース由来文字列             | `&'a str`                                  | 借用                                 |
| 共通文字列（タグ名・属性名） | `Atom<'a>`                                 | interning                            |
| AST ノードの子要素           | `bumpalo::collections::Vec<'a, T>`（将来） | arena allocation                     |

### `format!()` を hot path に置かない

```rust
// ❌ ループ内 format!() は文字列の heap 割り当てが毎回発生
for x in items {
    output.push_str(&format!("{}={}", x.key, x.value));
}

// ✅ write! を使うとバッファに直接書く
use std::fmt::Write;
for x in items {
    write!(output, "{}={}", x.key, x.value).unwrap();
}
```

### 早期 return / 早期 continue の活用

```rust
// ❌ 深いネストは branch predictor にも CPU cache にも悪い
fn process(node: &Node) {
    if let Some(name) = &node.name {
        if !name.is_empty() {
            if name.starts_with("svelte:") {
                handle_special(name);
            }
        }
    }
}

// ✅ 早期 return でフラットに
fn process(node: &Node) {
    let Some(name) = &node.name else { return };
    if name.is_empty() { return; }
    if !name.starts_with("svelte:") { return; }
    handle_special(name);
}
```

### 計測なき最適化は禁止

「速くなりそう」と感じる変更でも、必ず `./scripts/bench/bench.sh --quick` で計測する。
hot path に影響する PR には、変更前後のベンチマーク数値を PR 説明欄に記載するよう求める。

---

## エラーハンドリングと Result 型

- コンパイルエラー / 警告は **必ず `src/error/` に集約された型** で表現する
- ad-hoc な `String` / `anyhow::Error` をエラーとして返さない（公式の error code と一致しない）
- `Result<T, CompileError>` または同等の型で `?` を使って伝播する
- パニックを「エラー」として使わない（前述のメモリ安全性参照）

```rust
// ❌ ad-hoc なエラー
fn parse_attr(input: &str) -> Result<Attribute, String> {
    Err(format!("invalid attribute: {}", input)) // 公式のエラーコードと不整合
}

// ✅ 集約された型を使う
fn parse_attr(input: &str) -> Result<Attribute, CompileError> {
    Err(CompileError::InvalidAttribute { value: input.into() })
}
```

---

## ライフタイムと借用

rsvelte は OXC 流の arena allocation を志向しており、ライフタイム `'a` がコード全体を貫いている部分がある。
新規コードもこの設計に整合させる:

- ソース文字列から取れる文字列は `&'a str` で借用する
- 既存コードが `'a` を引いているモジュールに新しい型を追加するなら、その型も `'a` を引く
- 不要に `'static` を強制しない
- 関数の戻り値が借用のままで返せるなら、`String::from(...)` で所有化しない
- ライフタイム省略規則（lifetime elision）が適用できる場面では明示しない

```rust
// ❌ 借用で済むのに String を返す
fn get_name<'a>(elem: &'a Element) -> String {
    elem.name.to_string()
}

// ✅ 借用のまま返す
fn get_name<'a>(elem: &'a Element) -> &'a str {
    &elem.name
}
```

---

## Rust イディオム / clippy

`cargo clippy --all-targets --all-features -- -D warnings` でクリーンに通ること。
レビューでは特に以下を確認する:

| パターン                                        | 推奨                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `match` の trivial 分岐                         | `if let` / `let else` で短く                                      |
| `.iter().map().collect()` の連鎖                | 不要な中間 Vec を作らないか確認（`Iterator::collect` は最後のみ） |
| 不要な `to_string()` / `to_owned()` / `clone()` | 借用で済まないか確認                                              |
| `.unwrap_or_else(\|_\| ...)` で重い処理         | `unwrap_or_default()` / `?` の方が良い場合あり                    |
| 小さい関数の手書きループ                        | イテレータコンビネータ（`map`, `filter`, `find`）                 |
| 文字列比較で `==` のみ                          | ASCII / 大文字小文字の意味を確認                                  |
| `if x { true } else { false }` 等の冗長な式     | clippy 指摘あり、素直に `x` と書く                                |
| `Vec<T>` の `len() == 0`                        | `is_empty()` を使う                                               |

### `match` の網羅性を活用

```rust
// ❌ wildcard で新バリアント追加時に検出できない
match node {
    Node::Element(_) => ...,
    Node::Text(_) => ...,
    _ => ..., // 新バリアント追加時に静かに通ってしまう
}

// ✅ 明示的に列挙し、新バリアント追加時にコンパイルエラーで発見する
match node {
    Node::Element(_) => ...,
    Node::Text(_) => ...,
    Node::Block(_) => ...,
    // 新バリアントが追加されればここがコンパイルエラーになる
}
```

`#[non_exhaustive]` でない限り、外部 enum でなければ wildcard は避ける。

---

## テストカバレッジ

### 修正・機能追加の PR

- 必ず対応するテストケースの追加または変更が含まれているか確認
- エッジケースとエラーハンドリングのテストも含まれているか確認
- 公式 Svelte の fixture との整合性が取れているか（`pnpm run compatibility-report` で確認）

### パーサー / AST 変更の PR

- 新しい構文 / 新しい AST バリアントを追加した場合
  - 対応する fixture が公式テストに存在するか
  - 存在しなければ `tests/` 配下に Rust 側のテストを追加するか
- パース失敗ケース（不正な入力）に対する `compiler-errors` テストが追加されているか

### コード生成変更の PR

- `pnpm run compatibility-report` で client / server / css の fixture pass 数が増減していないか
- もし減っているなら理由を明確にする（regression なら阻止）
- バイト単位の出力一致を期待する fixture 比較で、空白・改行・カンマ位置まで正確か

### パフォーマンス改善の PR

- 既存機能が壊れていないことを確認する網羅的なテストが pass しているか
- ベンチマーク数値が PR 説明欄に記載されているか
- 計測条件（コミット、コマンド、ファイルセット）が再現可能か

### リファクタリングの PR

- 機能変更を含まないことが diff から読み取れるか
- テスト pass 数 / fixture 出力が変更前と完全一致しているか

### Cargo.toml / 依存関係変更の PR

- 変更理由が明記されているか
- 新規依存追加なら、ライセンス・メンテナンス状況・代替案の検討記録があるか
- すべての品質ゲート（cargo test、clippy、互換性レポート）が通ることを確認

### テストコード自体の品質

#### コメントとアサーションの整合性

```rust
// ❌ コメントとアサーションが矛盾
// 子ノードが残っていることを確認
assert!(elem.children.is_empty()); // ← 矛盾

// ✅ 一致
// 子ノードが残っていないことを確認
assert!(elem.children.is_empty());
```

#### 冗長なアサーション

```rust
// ❌ 冗長: 結果取得の直前に同じ呼び出しを評価
assert!(parse(input).is_ok());
let result = parse(input).unwrap(); // 2 回 parse している

// ✅ 結果を一度取得して検査
let result = parse(input).expect("must parse");
assert_eq!(result, expected);
```

#### スナップショット / fixture 依存

- スナップショットを更新した場合、それが意図した変更か commit メッセージで説明する
- 自動生成された fixture（`fixtures/<commit>/` 配下）の変更は、コミット時にコード変更とは別にしてレビューしやすくする

---

## DRY 原則の遵守

### 1. パース処理の重複

```rust
// ❌ 似たトークン消費を複数箇所で書き直す
fn parse_attribute_value(input: &str) -> ... {
    skip_whitespace();
    expect_char('=');
    skip_whitespace();
    // ...
}
fn parse_directive_value(input: &str) -> ... {
    skip_whitespace();
    expect_char('=');
    skip_whitespace();
    // ...
}

// ✅ 共通ヘルパーに抽出
fn expect_equals(parser: &mut Parser) -> Result<()> {
    parser.skip_whitespace();
    parser.expect_char('=')?;
    parser.skip_whitespace();
    Ok(())
}
```

### 2. AST トラバーサルの重複

`visit_*` / `walk_*` 関数で同じ走査ロジックが複数箇所に書かれていないか。
visitor パターンを共通化し、各フェーズが必要な部分だけ override する。

### 3. エラーメッセージの重複

```rust
// ❌ 同じメッセージを複数箇所でハードコード
Err(CompileError::Custom("invalid attribute name".into()))
// 別ファイルで...
Err(CompileError::Custom("invalid attribute name".into()))

// ✅ エラーコードを定義して共通化
Err(CompileError::InvalidAttributeName)
```

### 4. 判定基準

- **3 回以上繰り返されるコードは共通化を検討**
- **2 回でも、変更時に両方を更新し忘れるリスクがあれば共通化**
- ただし、過度な抽象化は避ける（偶然の一致を無理に共通化しない、特に hot path での trait オブジェクト化）

---

## 命名規則

- **型・enum・enum バリアント**: `PascalCase`
- **関数・モジュール・フィールド**: `snake_case`
- **定数・static**: `SCREAMING_SNAKE_CASE`
- **公式 Svelte の JS 側名前**: 公式名を `snake_case` 化したものを使う
  - 公式 `parseAttribute` → rsvelte `parse_attribute`
  - 公式 `IfBlock` → rsvelte `IfBlock`（バリアント名はそのまま PascalCase 維持）

### 短縮名の禁止

```rust
// ❌
let attr = ...; let exp = ...; let cnt = ...;

// ✅
let attribute = ...; let expression = ...; let count = ...;
```

例外: ループカウンタ `i`、`j` や、慣習化された `id` / `idx` は許容。

### コピペ由来の命名ミス

類似ファイルをコピペして作成する際、定数名・関数名を変更し忘れるケースがある:

```rust
// ❌ ファイル名は server.rs なのに関数名が client_*
// src/compiler/phases/3_transform/server/visitors.rs
pub fn client_visit_element(...) { ... }

// ✅
pub fn server_visit_element(...) { ... }
```

レビュー時はファイル名・モジュールパスと、内部の関数名・定数名の整合性を確認する。

---

## コメント方針

CLAUDE.md / AGENTS.md の方針に従い、**コメントは原則書かない**。書く場合は WHY に限定する。

| OK                                                              | NG                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| 公式 Svelte と意図的に異なる実装にしている理由                  | `// increment counter`（自明な WHAT）                          |
| 性能上の理由で非自明な実装にしている理由                        | `// fix bug from issue #123`（PR / commit message に書くべき） |
| Rust の借用チェッカーを通すために自然でない書き方をしている理由 | `// TODO: implement later`（todo!() を使うか issue 化）        |
| 入力の不変条件・関数の事前条件                                  | 関数シグネチャから読み取れる情報の繰り返し                     |

```rust
// ❌ WHAT を説明（コードを読めば自明）
// elem.children を反復処理する
for child in &elem.children {
    process(child);
}

// ✅ WHY を説明（非自明な制約）
// 公式 Svelte は parent から child の順で visit するため、ここでも同じ順序を保つ
// （順序を変えると codegen 出力の式評価順が変わり fixture が落ちる）
for child in &elem.children {
    process(child);
}
```

---

## Cargo / 依存関係

### 新規依存追加のレビュー基準

- **本当に必要か**: std で実現できないか確認
- **ライセンス**: MIT / Apache-2.0 / BSD 系統か確認
- **メンテナンス状況**: 最終更新が 2 年以上前なら警戒
- **transitive dependencies**: `cargo tree -p <new-crate>` で連鎖して入る依存を確認
- **OXC との整合**: 既に OXC が使っているクレートを優先する

### Cargo.toml の整理

- **未使用の dependency**: コード内で使われていないクレートが残っていないか
- **feature flag**: 必要最小限の features を有効化しているか
- **profile 設定**: `[profile.release]` の設定変更がある場合、計測根拠があるか

```bash
# 使われていない可能性のある依存を発見
cargo machete  # 別途インストール

# 重複バージョンを発見
cargo tree -d
```

---

## `unsafe` の取り扱い

`unsafe` ブロック / `unsafe fn` / `unsafe impl` を新規導入する PR では、以下を必ず確認:

- **必要性**: 本当に safe Rust では書けないのか
- **不変条件**: そのブロックが守るべき安全性条件をコメントで明示
- **テスト**: `unsafe` を含む関数の境界条件のテストが存在するか
- **代替案**: `unsafe` を使わない実装と比較して、性能差が計測されているか

```rust
// ❌ 理由がない unsafe
unsafe { *ptr }

// ✅ 安全性条件をコメントで documents
// SAFETY: `ptr` は self.allocate() で確保したばかりで、まだ free されていない。
// アクセス範囲は alloc 時に保証された size の範囲内。
unsafe { *ptr }
```

レビューで `unsafe` のブロックを見つけたら、原則 Critical 指摘として理由を確認する。

---

## NAPI 境界

`src/lib.rs` および `src/napi*` 配下の NAPI 公開 API はリポジトリの外部境界。以下を厳しく確認:

- **入力検証**: JS 側から渡される値を `unwrap()` していないか
- **エラー伝播**: Rust 内のエラーが JS 側で意味のある形（メッセージ、code）で受け取れるか
- **公式 Svelte API との互換性**: `compile()` / `parse()` / `preprocess()` 等の公開関数の引数・戻り値の形が公式と一致しているか
- **破壊的変更**: 既存の vite-plugin-svelte / svelte-check 等の consumer が動かなくなる変更を含んでいないか
- **ABI 安定性**: 構造体のフィールド順序や enum タグ値の変更が、ビルド済みバイナリの互換性を壊さないか

破壊的変更を含む場合、PR 説明欄に「Breaking change」セクションを設けて影響範囲を明示するよう求める。

---

## PR の作成ルール

### PR タイトル

英語で記述、以下のプレフィックスを使用（既存リポジトリの慣習と最近のコミット履歴に従う）:

- `feat:` 新機能
- `fix:` バグ修正
- `refactor:` リファクタリング
- `perf:` 性能改善
- `docs:` ドキュメント
- `test:` テスト
- `chore:` その他（依存更新、ビルド関連等）

```text
✅ fix: restore original double quotes after OXC normalization in SSR scripts
✅ refactor: build_program() component wrapper uses bridge pipeline
✅ perf: avoid cloning element children during transform
❌ Update files
```

タイトルは利用者視点で、何が変わったかが伝わるように。

### PR 説明欄

```markdown
## What

[変更内容の簡潔な説明]

## Why

[なぜ必要か、対応する公式 Svelte の commit / issue があれば参照]

## How

[アプローチの概要、特に公式実装と差異がある場合の理由]

## Test plan

- [ ] cargo test --release
- [ ] pnpm run compatibility-report（変更前後の pass 数）
- [ ] ./scripts/bench/bench.sh --quick（hot path への影響がある場合）
- [ ] vitest（NAPI 経由の挙動に影響する場合）

## Performance impact (if applicable)

|                  | Before | After | Delta |
| ---------------- | -----: | ----: | ----: |
| Parse            |   X ms |  Y ms |    Z% |
| Compile (Client) |   X ms |  Y ms |    Z% |
| Compile (SSR)    |   X ms |  Y ms |    Z% |
```

---

## レビュー時のチェックリスト

```markdown
【公式 Svelte 実装との整合性 — 最優先】
✅ 対応する公式実装 (svelte/packages/svelte/src/compiler/) を参照したか？
✅ アルゴリズム・判定順序・エッジケースが公式と一致しているか？
✅ 出力（生成 JS / CSS / エラーコード / メッセージ）が公式と一致しているか？
✅ 公式と異なる実装にする場合、理由がコメント or commit message に明記されているか？
✅ HashMap など順序非保証コレクションを使っていないか？（IndexMap / BTreeMap で代替）

【メモリ安全性 / パニック】
✅ production コードで unwrap() / expect() / panic! / todo! / unimplemented! を新規追加していないか？
✅ 配列インデックスアクセスで範囲チェックがあるか？
✅ ロック取得以外の unwrap() に正当な理由があるか？

【パフォーマンス】
✅ hot path で String / Vec / Box / format! を新規割り当てしていないか？
✅ 大きな AST ノードに対して .clone() していないか？
✅ serde_json::Value を新規導入していないか？
✅ ループ内で重い処理（DB アクセス相当の I/O はないが、ファイル I/O / 正規表現コンパイル等）が走っていないか？
✅ ベンチマーク変動の計測根拠があるか？（hot path に影響する変更の場合）

【エラーハンドリング】
✅ src/error/ の集約型を使っているか？
✅ ad-hoc な String / anyhow::Error を新規導入していないか？
✅ Result + ? で伝播しているか？

【ライフタイム / 借用】
✅ ソース由来の文字列を不必要に String 化していないか？
✅ 周囲のコードが 'a を引いているモジュールで、新規型も 'a に整合しているか？
✅ 不要な 'static 強制をしていないか？

【Rust イディオム / clippy】
✅ cargo clippy --all-targets --all-features -- -D warnings がクリーンに通るか？
✅ match の wildcard で新バリアント追加時の検出を逃していないか？
✅ Vec.len() == 0 ではなく is_empty() を使っているか？

【テストカバレッジ】
✅ 変更されたロジックに対応するテストが追加 or 更新されているか？
✅ 公式 Svelte の fixture pass 数が変更前と比較して維持 or 向上しているか？
✅ パース失敗・コード生成エッジケースのテストが含まれているか？
✅ テストのコメントとアサーションの期待値が矛盾していないか？
✅ 冗長なアサーション（同じ呼び出しを 2 回）がないか？

【DRY 原則】
✅ 重複したパース処理 / トラバーサル / エラーメッセージがないか？
✅ 偶然の一致を無理に共通化していないか？

【命名規則】
✅ 型 PascalCase / 関数・モジュール snake_case / 定数 SCREAMING_SNAKE_CASE か？
✅ 公式 Svelte の名前を snake_case 化した形に整合しているか？
✅ 短縮名（attr / exp / cnt）を使っていないか？
✅ コピペ由来の名前不一致がないか？（ファイル名と関数名の整合）

【コメント】
✅ 不要なコメント（自明な WHAT）を新規追加していないか？
✅ 必要な WHY コメント（公式と差異がある理由 / 性能上の理由）が書かれているか？

【unsafe】
✅ unsafe を新規追加している場合、SAFETY コメントで安全性条件が明示されているか？
✅ unsafe を使わない代替案と比較されているか？

【NAPI 境界】
✅ JS から受け取る値を unwrap() していないか？
✅ 公開 API の破壊的変更を含む場合、PR 説明欄に明示されているか？

【依存関係】
✅ 新規依存追加に必要性・ライセンス・メンテ状況の検討があるか？
✅ 未使用の依存が残っていないか？
```

---

## GitHub PR コメント対応のワークフロー

レビューコメントを受け取った場合、以下の手順で対応する:

### 1. コメントを 1 つずつ対応

複数のコメントがある場合でも、1 つずつ順番に対応する:

- 各コメントへの対応が明確になる
- コミット履歴が追跡しやすくなる
- レビュアーが確認しやすくなる

### 2. 対応後にコミット

各コメントに対応したら、その変更をアトミックにコミットする。

### 3. コメントに返信

コミット後、GitHub コメントに返信する。返信には **対応したコミットハッシュを必ず含める**:

```markdown
ご指摘ありがとうございます。

[対応内容の説明 — 公式実装との整合性 / 性能影響など]

対応コミット: abc1234
```

### 4. GitHub API でコメント返信

```bash
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
  -f body="返信内容"
```

### 「対応しない」と判断した場合

レビュアーの指摘に対応しないという判断をする場合も、必ず返信して理由を明示する:

```markdown
ご指摘ありがとうございます。

[対応しない理由 — 例: 公式 Svelte 実装と整合性を取るためこの形にしている / hot path ではないため Cow 化のコストが見合わない 等]

別途、本 PR スコープ外として issue 化しました: #N
```
