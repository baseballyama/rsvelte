# rsvelte 実装レビューチェックリスト

Phase 4 の Agent ②（コンパイラ実装）③（パフォーマンス）④（テスト）が読む。rsvelte は公式 Svelte コンパイラ（`submodules/svelte/packages/svelte/src/compiler/`）の Rust ポート。ゴールは 100% テスト互換 / 100x 性能 / OXC 統合。

## 1. 公式実装との整合性（最重要）

| Rust（`crates/rsvelte_core/src/`） | 公式 JS（`submodules/svelte/packages/svelte/src/compiler/`） |
|---|---|
| `compiler/phases/1_parse/` | `phases/1-parse/` |
| `compiler/phases/2_analyze/` | `phases/2-analyze/` |
| `compiler/phases/3_transform/` | `phases/3-transform/` |
| `ast/` | `types/` |
| `error/` | `errors.js`、`warnings.js` |

- [ ] 対応する公式ファイル・関数を特定し、アルゴリズム・判定順序・エッジケース処理が一致する
- [ ] 公式の `if` / `switch` の順序を保つ（順序で出力が変わる箇所がある）
- [ ] 生成コード・エラーメッセージ・警告がバイト単位で一致する
- [ ] エラーコード・警告コードが公式と同じ文字列
- [ ] 関数名・変数名は公式の snake_case 翻字（`analyzeComponent` → `analyze_component`）
- [ ] 意図的な逸脱にはコメントで理由を明記
- [ ] サブモジュールの最新版に追従（`cd submodules/svelte && git log -1 --format='%H %s'`）

**ずれやすいパターン**:

| JS | Rust で注意する点 |
|---|---|
| `startsWith` / `endsWith` / `includes` / `trim` | 対応メソッドはあるが `trim` の空白定義などに差異 |
| 正規表現 | `regex` クレートは JS と構文・Unicode 扱いが違う。手書き判定に置換したら同値性を確認 |
| `Number` 演算 | `i32` / `u32` / `f64` の選択で挙動が変わる |
| `Map` / `Set` / オブジェクトの列挙順（挿入順） | `HashMap` は順序不定。出力に影響するなら `IndexMap` / `BTreeMap` |
| `throw new Error(...)` | `Result` + `error/` の型で返す。`panic!` にしない |

参照: `git diff ${BASE_BRANCH}...HEAD -- <path>`、対応する公式ファイルを `Read`、公式 fixture は `pnpm run compatibility-report`。

## 2. メモリ安全性・パニック

| パターン | production パスでの扱い |
|---|---|
| `.unwrap()` / `.expect()` | 原則禁止。`?` / `match` / `if let` に置換。残す場合は不変条件をコメントで証明 |
| `panic!` / `todo!` / `unimplemented!` / `unreachable!` | 原則禁止。`unreachable!` は本当に到達不能な場合のみ、理由をコメント |
| `slice[i]` / `s[a..b]` | 範囲が保証されないなら `.get()` / `.get(a..b)` |
| 整数変換 `as` | 位置は `u32`。`usize → u32` は `try_from` or 範囲保証をコメント |
| `unsafe` | 原則 **Critical**。必要なら `// SAFETY:` で不変条件を明記し、ブロックを最小化 |

例外（False Positive）: テストコード（`#[cfg(test)]`、`tests/`）/ `Mutex::lock().unwrap()` などポイズン時にパニックが妥当な箇所 / 型やパターンマッチで不変条件が証明されている箇所（コメント必須）。

- [ ] 異常入力（巨大ソース・深いネスト・不正 UTF-8・切れたトークン）でパニックしない
- [ ] 再帰深度が入力に比例する箇所はスタックオーバーフロー対策（明示スタック or 深度制限）を検討
- [ ] 指数時間・空間になる処理（バックトラック等）がない

## 3. パフォーマンス（hot path: パース・トラバーサル・codegen）

- [ ] ループ・再帰・visitor 内での `String::new` / `Vec::new` / `Box::new` / `format!` / `to_string()` / `to_owned()` がない
- [ ] AST ノードの `.clone()` は参照 / `Cow` / インデックスで代替できないか
- [ ] `serde_json::Value` の **新規使用は Critical**（キーごとに `String` malloc + `IndexMap` slot + SipHash を払う。typed traversal に寄せる）
- [ ] ソースから借用できる文字列を新規割り当てしていない
- [ ] 不要な中間 `Vec`（イテレータチェーンで済むか、`collect` は必要か）
- [ ] `format!` で組み立てて push するより `write!` で直接書く
- [ ] early return / `continue`、ループ外に出せる計算を出す
- [ ] 文字列検索の置換は setup コスト（`StrSearcher::new` 等）が削れる場合のみ効く（`CharSearcher` はすでに memchr）
- [ ] 構造体フィールドはノードごとに払う。型に追加する前に「何個のノードが持つか」を見る
- [ ] hot path 変更は `./scripts/bench/bench.sh --quick` で計測し数値を添える（`--criterion` / `--profile` で詳細）。差がなければ戻す

| 用途 | 推奨 |
|---|---|
| キーが小さいマップ | `FxHashMap` / `FxHashSet`（`rustc_hash`） |
| 順序が出力に影響するマップ | `IndexMap` |
| 要素数が通常少ない `Vec` | `SmallVec<[T; N]>` |
| 短い所有文字列 | `CompactString` |
| ソースのスライス | `&'a str` |
| 大量出現する短い文字列 | `Atom<'a>` |
| ライフタイム付きの大量ノード | arena（`bumpalo`） |

## 4. エラーハンドリング

- [ ] エラー・警告は `crates/rsvelte_core/src/error/` の型で表現。ad-hoc な `String` / `anyhow` を production で使わない
- [ ] `Result` + `?` で伝播。回復可能なエラーを `panic!` にしない
- [ ] 公式の `errors.js` / `warnings.js` と同じコード・メッセージ・位置（start / end）
- [ ] 位置は `u32` の byte offset。行・列変換は既存ユーティリティを使う

## 5. ライフタイム・借用

- [ ] `'a` はソース / arena から一貫して引く。不要な `'static` を要求しない
- [ ] 周囲の型が `'a` を持つなら合わせる（`String` を返して借用を捨てない）
- [ ] `Rc` / `RefCell` / `Arc` / `Mutex` の導入前に所有権設計を見直す
- [ ] 引数は `&str` / `&[T]` / `impl Trait` を優先し、`&String` / `&Vec<T>` にしない

## 6. Rust イディオム・clippy

- [ ] `cargo fmt --all` と `cargo clippy --all-targets --all-features -- -D warnings` がクリーン（`.githooks/pre-commit` が実行）
- [ ] `match` は網羅的に書き、`_ =>` を安易に置かない（新バリアント追加をコンパイルエラーで検出できるように）
- [ ] `if let` / `let else` / `matches!` / イテレータを適切に使う
- [ ] ジェネリクス・trait 階層・マクロは必要最小限
- [ ] `#[derive]` は必要なものだけ、`pub` は必要な範囲に限定（`pub(crate)`）

## 7. テストカバレッジ

| PR の種類 | 必要なテスト |
|---|---|
| バグ修正 | 再現するテスト（fixture or 単体）が先にあり、修正で pass する |
| 新機能 / 新構文 | 公式 fixture でカバーされているか（`pnpm run generate-fixtures` → `pnpm run compatibility-report`）。なければ `tests/` に単体テスト |
| パーサー / AST | パース結果の JSON 比較（`node scripts/diff/compare-parsers.mjs`）、エッジケース（空・ネスト・不正入力） |
| codegen | 対応する runtime / ssr / snapshot fixture が pass し、pass 数が減っていない |
| 性能改善 | ベンチ結果（`./scripts/bench/bench.sh --quick`）と出力の同一性 |
| リファクタ | 既存テストがすべて pass。テスト変更が不要なはず（変更していれば理由を確認） |
| Cargo / 依存 | `cargo test --release` と clippy がクリーン |

- [ ] 新ロジック・分岐・エッジケース（境界値、off-by-one、空入力、Unicode）にテストがある
- [ ] エラー・警告の変更には compiler-errors / validator の fixture or テストがある
- [ ] 既存テストの変更・削除でカバレッジが失われていない
- [ ] テストのコメントとアサーションが矛盾していない
- [ ] 同じことを繰り返し assert する冗長なテストがない
- [ ] スナップショット・fixture の更新は差分を目視確認し、退行を「期待値更新」で隠していない
- [ ] `cargo test --release` で実行する（debug なら `RUST_MIN_STACK=33554432`）

## 8. DRY・重複

- [ ] 同じパース / トラバーサル / エラー生成ロジックを複数箇所に書いていない（3 回以上は共通化）
- [ ] 公式が 1 関数で行う処理を複数箇所にポートしていない（two-ports 化すると比較するゲートがない）
- [ ] 既存ユーティリティ（`ast/`、`error/`、shared モジュール）を再利用
- [ ] 共通化のための過度な抽象（trait / ジェネリクス）を持ち込んでいない

## 9. 命名規則

- [ ] 型 / trait / enum: `PascalCase`、関数 / 変数 / モジュール: `snake_case`、定数: `SCREAMING_SNAKE_CASE`
- [ ] 公式の識別子の snake_case 翻字を使う
- [ ] 短縮名禁止（`exp` → `expression`、`attr` → `attribute`。`ctx` は既存慣習のみ）
- [ ] コピペ由来の名前不一致（`client` 関数内に `server` 変数など）がない
- [ ] `is_` / `has_` / `should_` は `bool` 返却に限定

## 10. コメント方針

| OK | NG |
|---|---|
| コードから読めない WHY（制約・理由）を 1 行で | 何をしているかの逐語説明 |
| 公式からの意図的逸脱とその理由 | PR / issue 番号、変更履歴、由来 |
| `// SAFETY:`、`unwrap` 残置時の不変条件の証明 | セクション見出しコメント |
| 公式の対応箇所（ファイル名・関数名） | 理由のない `TODO` |

- [ ] 「公式と同じ」と書くコメントは条件・順序・引数まで一致を確認してから書く（忠実性を主張するコメントは検証されずに信頼される）
- [ ] 兄弟を数えるコメント（「他の 2 箇所も同様」）は数を検証する

## 11. Cargo・依存関係

- [ ] 新規依存は本当に必要か（標準ライブラリ / 既存依存で代替できないか）
- [ ] ライセンス（MIT / Apache-2.0 互換）、メンテナンス状況
- [ ] OXC が使っているクレートを優先（`oxc_*`、`rustc_hash`、`bumpalo`、`compact_str`）
- [ ] `cargo tree -p <crate>` で推移的依存の増加を確認、`cargo tree -d` で重複バージョンなし
- [ ] 未使用依存なし（`cargo machete`）、feature は必要最小限（`default-features = false`）
- [ ] 別ワークスペース `crates/rsvelte_lint_types` の `Cargo.lock` を壊していない（`scripts/ci/check-lint-types-lock.mjs`）

## 12. NAPI・公開境界

- [ ] `crates/rsvelte_napi` の公開 API に破壊的変更がない（あれば changeset とドキュメント）
- [ ] JS からの入力（オプション・ソース文字列）を検証し、`unwrap` せず JS 例外として返す
- [ ] 公式 `svelte/compiler` の `compile` / `compileModule` / `parse` オプションと互換
- [ ] `node scripts/compat-corpus/binding.mjs --stage` でステージし、`pnpm run test:napi-options` / `test:vps` / `corpus:matrix` で確認
- [ ] `.changeset/` の changeset が必要な消費者パッケージをすべて列挙している

## 13. PR 作成ルール

- タイトル: `fix:` / `feat:` / `perf:` / `refactor:` / `chore:` / `docs:` + 簡潔な要約
- 1 PR = 1 論理的変更。無関係なリファクタ・フォーマット変更を混ぜない。`Cargo.lock` / サブモジュール更新は意図したものだけ
- 本文テンプレート:

```
## What
## Why（対応する公式 commit / issue のリンク）
## How
## Test plan（cargo test --release / compatibility-report の pass 数 / 追加テスト）
## Performance impact（bench.sh の数値。影響なしなら理由）
```

## 14. GitHub PR コメント対応

1. `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments` で未解決コメントを取得
2. **1 件ずつ**対応: 修正 → コミット → プッシュ
3. 返信にコミットハッシュを含める: `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies -f body="Fixed in <hash>: <説明>"`
4. 対応しない場合も理由を返信する
5. すべて対応後 `gh pr checks` で CI を確認
