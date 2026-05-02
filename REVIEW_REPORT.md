# rsvelte フルコードレビューレポート

レビュー実施日: 2026-05-02
対象: `main` ブランチ全体（commit `9ef3cbb`、Svelte サブモジュール `04c0368aa8d8` / v5.51.3）
レビュアー: Claude（自動レビュー、ユーザー就寝中の自走モード）

---

## TL;DR — 経営判断レベルのまとめ

**現状の品質**:
- 公式 Svelte 互換性レポート **3037/3037 (100%)** — 実装済み全カテゴリで完全パス。これは特筆すべき達成。
- `cargo fmt --check`、`cargo clippy --release --all-targets --all-features -D warnings` ともに **クリーン**。
- 公式 Svelte コンパイラとの構造整合性も良好（独自モジュール 11 件はすべて妥当な理由あり）。

**最重要の懸案 1 つ**:
- **`JsNode::Raw(serde_json::Value)` フォールバックバリアントが 140+ 箇所で消費されており、typed AST 設計を骨抜きにしている**。Pass A で発見した `serde_json::Value` 利用 ~370 件、ホットパス割り当て圧の高さ、ポイント単位の panic、これらすべての根本原因。Phase 2 を本格化させる前に段階的廃止計画が必要。

**緊急対応すべき個別バグ**:
- `magic_string.rs:305` の `split_at()` パニック（ユーザー入力到達可能性あり、debug-only assert でしかガードされていない）。
- `transform_async.rs:126` の `todo!("create_thunk not yet implemented")`（実は呼び出し経路がないため即時影響はないが、放置するとユーザーが書く async snippet で踏む可能性あり）。
- `blockers.rs:184` の `$effect` 検出欠落（reactive blocker 解析の不正確さ。Svelte 5 `$effect` を使うコードに影響）。
- `2_analyze/visitors/shared/snippets.rs:20, 88` のスニペット重複検出欠落（同名スニペットが黙ってシャドウされる）。

**機械的な低リスク改善**:
- 23 箇所の `std::collections::HashMap` / `HashSet::new()` を `FxHashMap` / `FxHashSet` に置換（振る舞い変更なし、性能のみ向上）。
- `arena.rs` の 11 unsafe ブロックに per-block `// SAFETY:` コメント追加。

詳細は本文参照。優先順位付きアクションリストは末尾セクション「推奨アクション」に。

---

## 0. レビュー手法と検証結果

### 採用方式

リポジトリ規模（**231,683 LOC / 271 ファイル**）が膨大なため、skill が想定する「8 Agent × チャンクごと × 指摘ゼロまで反復」を全領域に適用するのは現実的に不可能と判断し、2 パス方式を採用しました:

- **Pass A**: 7 並列 Explore Agent によるリポジトリ全域のスメルスキャン（panic、TODO、`serde_json::Value`、ホットパス割り当て、unsafe、公式整合、テストカバレッジ）
- **Phase 3**: `src/ast/` の精読レビュー
- **Pass B**: Pass A のヒートマップ上位 10 領域を 5 クラスタにまとめた並列深掘りレビュー

### 重要: サブエージェントの False Positive を検証済み

サブエージェントはコード周辺の短絡評価ガードを見逃して "DANGEROUS unwrap" と誤報告するケースが複数ありました。本レポートでは以下を **直接コードを読んで検証し、誤報告として除外** しています:

| サブエージェントの主張 | 検証結果 | 実際 |
|----------------------|---------|------|
| `state_transforms.rs:672` の `memmem::find` unwrap が dangerous | **FALSE POSITIVE** | `if after_paren.starts_with("=>")` ガード済み（`after_paren` は `result[paren_close+1..].trim_start()`、`=>` を含む文字列の trim 前バイト列にも `=>` が必ず存在する） |
| `state_transforms.rs:992` の `find` unwrap が dangerous | **FALSE POSITIVE** | 直前で `if rhs.contains(&spread_pattern)` をチェック済み |
| `transform_script.rs:3410` の `chars().next().unwrap()` が empty で panic | **FALSE POSITIVE** | `&&` 短絡評価で `!s.is_empty() &&` の後にあるため empty 時には到達しない |
| `arena.rs` の 13 unsafe すべてに SAFETY コメントあり | **FALSE POSITIVE** | 実際には 11 ブロック中 1 つしかコメントなし（Pass A の認識が正しい） |
| `EachBlock.context: Option<Expression>` が公式と不一致 | **VERIFIED** | 公式は `Pattern \| null`、コメント自体に「Context pattern」と書かれているのに型は Expression |

False positive を排除した上で、本レポートは **検証済み所見のみ** を Critical / Major として扱います。Minor は agent 報告そのまま採録（影響が低いため誤差許容）。

### ベースライン

| チェック | 結果 |
|---------|------|
| `cargo fmt --check` | ✓ exit 0 |
| `cargo clippy --all-targets --all-features --release` | ✓ exit 0、警告なし |
| `cargo test --release` （全体） | ✗ `bin/test_reporter` のリンク失敗（**コードではなく macOS バージョンミスマッチによる環境問題** — `target/release/deps/libtikv_jemalloc_sys-*.rlib` が macOS 26.2 向けにビルド済み、現在のリンカは 11.0 互換モード。`cargo clean && cargo build` で解決可能） |
| `cargo test --release --lib --tests` （bin 除外） | ✓ 全スイートパス（最終スイート: 57 passed / 0 failed / 8 ignored） |
| `pnpm run compatibility-report`（CLAUDE.md 記載） | **3037/3037 (100%)** — 実装済み全カテゴリでパス（Preprocess 19 件 + Migrate 76 件はスキップ、これは未実装） |

### 補助成果物

詳細な中間データは以下に保存:

- `.review-artifacts/pass-a-findings.md` — Pass A 全 7 スキャンの集約結果
- `.review-artifacts/phase-3-ast-findings.md` — AST 精読レビューの検証済み所見

---

## 1. 構造評価（Phase 2 相当）

### 1-1. 公式 Svelte コンパイラとの整合性

**評価: 良好。**

- アライン済みフェーズモジュール: ~95
- rsvelte 独自モジュール: 11（**すべて妥当な理由あり**）
  - `1_parse/estree_compat/`、`resolve_lazy.rs`、`parser.rs`（OXC 連携のため必要）
  - `2_analyze/{binding_properties, blockers, control_flow, css_scoping, scope, scope_builder, store_subscriptions, errors, warnings}.rs`（公式の単一巨大ファイルを Rust モジュール性のために分割）
  - `3_transform/js_ast/`（OXC ベースの codegen レイヤ）
- 未実装: Preprocess（19 fixtures）、Migrate（76 fixtures）、Sourcemaps — CLAUDE.md で明記済み、ロードマップ通り

### 1-2. AST 設計の評価（詳細は §2 Phase 3）

- メモリレイアウト: 位置情報 `u32`、文字列 `CompactString`、大きな enum バリアントは `Box` 化済み — **良好**
- ライフタイム設計: 一貫した `'a` パラメータは無く、ほぼ owned。性能 100x 目標との整合性は要検討だが、現状の設計でも `compact_str` のおかげで多くは SSO で済んでいる
- **重大問題**: `JsNode::Raw(Value)` フォールバックバリアント（§2 Critical で詳述）

### 1-3. パイプラインの一貫性

- フェーズ間で AST を直接渡しており、中間シリアライズ → 再パースのアンチパターンは検出されず（ただし `JsNode::Raw` 経由で実質的にそれが起きているケースはあり）
- エラー型は `src/error/mod.rs` に集約。warning は phase 2/3 に分散しているが、これは公式の構成（`errors.js` 集約 vs `warnings.js` 散在）の整合範囲

### 1-4. NAPI / 公開境界

- 主要 API は `src/lib.rs` 経由で公開
- `compile()`, `parse()`, `convert_to_legacy()` 等が公開
- `src/svelte2tsx/` は別ルートで公開（IDE / 言語ツール向け、コア互換テストとは独立）
- 破壊的変更は検出されず

---

## 2. AST / 基盤型レビュー（Phase 3）

`src/ast/` 全 7 ファイル / 6,044 LOC を精読しました。

### 2-1. 良好な点

- 位置情報は **すべて `u32`**（`span.rs`、各構造体の `start`/`end`）— 設計目標通り
- 文字列は **`CompactString` を一貫採用**（200+ 箇所、SSO により <24 bytes は割り当てなし）
- `TemplateNode` の大きいバリアント（Element、Block 系）は `Box<T>` 済み
- 公式 Svelte の TS 型と命名が整合（`IfBlock`、`EachBlock`、`RegularElement` など）
- アリーナ（`ParseArena`）の設計は健全（append-only Vec + UnsafeCell + `!Sync` 明示）
- typed_expr.rs の `JsNode` は ESTree カバレッジが優秀（60+ バリアント）

### 2-2. Critical 所見（AST）

#### **C-AST-1**: `JsNode::Raw(Value)` の typed-AST 退行 — **このリポジトリ最大の構造的問題**

**場所**: `src/ast/typed_expr.rs:630`

```rust
pub enum JsNode {
    // ... 60+ typed variants ...
    Raw(Value),  // ← 型を諦めた未知ノードの退避先
}
```

**Raw が消費されている箇所（Pass A で全箇所スキャン済み）**:

| ファイル | 言及数 |
|---------|-------|
| `2_analyze/scope_builder.rs` | 30 |
| `1_parse/read/expression.rs` | 27 |
| `3_transform/client/visitors/expression_converter.rs` | 23 |
| `2_analyze/visitors/shared/utils.rs` | 14 |
| `ast/typed_expr.rs` | 12 |
| `2_analyze/visitors/snippet_block.rs` | 7 |
| `2_analyze/visitors/function_expression.rs` | 4 |
| 他 14 ファイル | 計 24 |

**合計 ~140 箇所**。Pass A で発見した `serde_json::Value` 利用 ~370 件のうち相当部分がここ起因。

**Raw に流れる典型的なケース**（Pass B 深掘りで確認）:

1. **コメント付きのステートメント** — `parse/read/expression.rs:5522` で「leadingComments は JSON-only concept」というコメントとともに、ステートメントを `to_value()` してコメントを追加して `Raw(Value)` に再ラップ。**通常の Svelte ファイルではステートメントの ~50% がここを通る**ため影響大。
2. **TypeScript 専用構文** — `TSAsExpression`、`TSTypeAssertion`、`TSParameterProperty`、destructured param の `typeAnnotation` 等。専用バリアント未定義のため Raw 経由。
3. **destructuring pattern** — `convert_binding_pattern_for_param()` および `convert_binding_pattern_with_adjustment()` が `Value` を返すため、`Expression::Value(v) => JsNode::Raw(v)` 経由（`js.rs:66`）で流入。
4. **未知の AST type 文字列** — `from_value()` の `_ => JsNode::Raw(value)` フォールバック（`typed_expr.rs:2588, 2591`）。公式 Svelte が新しいノード型を追加すると **rsvelte は黙って Raw に流す**（コンパイルエラーにならない）。

**消費側の典型パターン**: `value.get("type").and_then(|t| t.as_str())` の連鎖で動的ディスパッチ。`scope_builder.rs:961, 1920`、`expression_converter.rs:1732-1815`、`css/analyze.rs:55-64` などで反復。

**なぜ Critical か**:
- 性能: hot path で型なし JSON dispatch が走る（recursive walk + `format!`/`clone()` のホットスポットになる）
- 保守性: Svelte の AST 拡張に対するコンパイル時保証がない（黙って Raw に流れる）
- データロス: `expression_converter.rs:1812` の Unknown ノード fallback は `JsExpr::Raw("/* Unknown: X */")` を生成。**TS コードが silent に壊れた出力になる可能性**

**推奨対応**:

短期（**Phase 4 並走で実施可能**、1〜2 週間）:
1. `from_value()` のフォールバックを `panic!()` または `Result::Err` に変更（型カバレッジ漏れの早期検出。snapshot test で漏れを発見しやすくする）。
2. JsNode に `leading_comments: Option<Vec<Value>>` フィールドを追加し、コメント付きステートメントの Raw 化を排除（最も件数の多いケース、~50% の改善）。
3. `TSAsExpression`、`TSTypeAssertion`、`TSParameterProperty` の typed バリアントを追加。

中期（1〜2 ヶ月）:
4. `convert_binding_pattern_for_param/_with_adjustment/_object/_array` を typed JsNode 返却に書き換え（4 関数 / 影響箇所 10+）。
5. `scope_builder.rs` と `expression_converter.rs` を typed dispatch に書き換え（依存先の修正完了後）。

長期:
6. `JsNode::Raw` バリアント自体を削除する。

#### **C-AST-2**: `EachBlock.context` の型不一致

**場所**: `src/ast/template.rs:335`

```rust
pub struct EachBlock {
    pub start: u32,
    pub end: u32,
    pub expression: Expression,
    pub body: Fragment,
    /// Context pattern - serializes as null when None (required by tests)
    pub context: Option<Expression>,  // ← 公式は Pattern | null
    // ...
}
```

公式（`svelte/packages/svelte/src/compiler/types/template.d.ts:447-453`）:

```typescript
export interface EachBlock extends BaseNode {
    type: 'EachBlock';
    expression: Expression;
    /** The `entry` in `{#each item as entry}`. `null` if `as` part is omitted */
    context: Pattern | null;
    body: Fragment;
}
```

**問題点**:
- コメントは「Context pattern」と書いてあるのに型が `Expression`。
- `{#each items as {id, name}}` のような destructuring pattern を扱う際に Pattern 専用フィールド（`typeAnnotation` 等）が無い。
- 現状で全テストパスしているのは、Expression 側に Pattern 風のバリアント（ObjectPattern 等）が JsNode として混在しているため。**意図せざる依存**。

**推奨対応**: `Option<Pattern>` に変更（`Pattern` 専用 enum を新設するか、`JsNode::ObjectPattern | ArrayPattern | Identifier` のサブセット enum）。Pass B で downstream の影響範囲を確認したところ、scope_builder と expression_converter で TypeScript 注釈付きパターンが Raw 経由になっているのと同根の問題。

#### **C-AST-3**: `Expression::Lazy` の不変条件が型システムで保証されない

**場所**: `src/ast/js.rs:67-82` および 8 箇所の panic

`Expression::Lazy { start, end, ts }` バリアントは「Phase 1 終了後にすべて解決されるべき」前提だが、解決されていない場合のアクセサが panic で落とす設計:

| 場所 | 操作 |
|------|------|
| `js.rs:129` | `as_json()` |
| `js.rs:149` | `as_node()` |
| `js.rs:256` | `as_node_ref()` |
| `js.rs:502` | serialization |
| `1_parse/read/expression.rs:68` | JsNode 変換 |
| `2_analyze/visitors/script.rs:60` | analyze 開始時 |
| `2_analyze/visitors/snippet_block.rs:152, 175, 578` | snippet 解析時 |
| `print/helpers.rs:881` | 印字時 |

**推奨対応**: type-state パターン:

```rust
// Phase 1 中
pub enum ParsedExpression { Lazy { ... }, Typed(TypedExpr), Value(Value) }

// resolve_lazy_expressions() の戻り値（Phase 2 以降）
pub enum ResolvedExpression { Typed(TypedExpr), Value(Value) }
//                             ↑ Lazy バリアントなし — 型システムで保証
```

Phase 1 → 2 境界の API を変える必要があるため影響大だが、8 箇所の panic を完全削除でき、設計の正確性が大幅向上。

### 2-3. Major 所見（AST）

#### **M-AST-1**: `arena.rs` の `unsafe` ブロックに per-block SAFETY コメントが欠落

**場所**: `src/ast/arena.rs`

実数: **11 unsafe ブロック中、SAFETY コメントは 1 つだけ**（line 281、しかも短い）。

行: 80, 91, 111, 122, 128, 150, 174, 188, 204, 215, 260, 289 すべてで欠落。

設計自体は正しい（`!Sync` 単一スレッド、append-only Vec、`UnsafeCell` 経由 raw pointer はエイリアスしない）が、コードレビュー時の検証コストが高い。

**推奨対応**: 機械的な追加作業（30 分〜1 時間）。テンプレ化したテキストでよい:

- `80, 91, 111, 122, 128, 150, 174, 188`: 「ParseArena は `!Sync` で append-only。`UnsafeCell` 経由の生ポインタはエイリアスしない」
- `204, 215`: 「Clone/Debug は単一スレッドで Vec の不変参照のみ取得する」
- `279, 289`: 「thread-local SERIALIZE_ARENA がセットされている期間内に限定された transmute。`with_serialize_arena()` スコープ外では `try_get_serialize_arena()` が None を返してガードする」
- `250` の `pub unsafe fn`: ドックコメントに「呼び出し側が arena lifetime を保証する責任」と明記

#### **M-AST-2**: `css.rs` がスタブで CSS AST を `Vec<serde_json::Value>` で保持

**場所**: `src/ast/css.rs:1-32`

公式は `Atrule`、`Rule`、`SelectorList`、`Block`、`Declaration` の typed AST を完備。rsvelte はスタブのまま。Pass A で発見した `2_analyze/css/analyze.rs` の 36 件の `Value` walk はこの設計の下流症状。

**推奨対応**: 公式の CSS 型をミラーした typed enum を `src/ast/css.rs` に整備。**CSS は他フェーズと結合度が低く、独立に修正可能**（Pass B B1 の所見）。Pass B の見積もりで 6 person-days 規模、リスク低。

### 2-4. Minor 所見（AST）

- **m-AST-1**: `Cargo.toml` の `[lib] crate-type = ["cdylib", "rlib"]` でビルド時に `output filename collision` 警告。`["cdylib", "lib"]` または出力名の差別化を推奨。
- **m-AST-2**: AttributeValue の untagged enum serialization で手動フィールド順序管理。snapshot test でカバーされているはずだが、新フィールド追加時に順序漏れリスクあり。
- **m-AST-3**: Visitor / walker パターンが現状はファイル横断で散在。AST 拡張時の網羅性確保のため、`src/ast/` に集中型 visitor trait を導入する余地あり（後回し可）。

---

## 3. 実装レビュー（Phase 4 / Pass B 深掘り 5 クラスタ）

Pass A のヒートマップ上位 10 領域を 5 クラスタに集約して並列で深掘りしました。

### 3-1. クラスタ B1: typed-AST 退行（最重要）

**対象**: `scope_builder.rs`、`expression_converter.rs`、`css/analyze.rs`、`1_parse/read/expression.rs`

§2 の C-AST-1 と同根。代表的な所見:

#### **F1 (Critical)**: `expression.rs:5490-5557` のコメント分配が ~50% のステートメントを `Raw` に変える

```rust
let mut stmt_value = stmt_node.to_value();      // typed → Value（重い）
obj.insert("leadingComments", ...);             // 修正
body_nodes.push(JsNode::Raw(stmt_value));       // Raw に再ラップ
```

JsNode の各 statement variant に `leading_comments: Option<Vec<Value>>` を追加すれば回避可能。**最も改善効果が高い修正候補**（推定 2 person-days、影響範囲: 全フェーズで Raw 経由経路が大幅減）。

#### **F2 (Critical)**: `expression_converter.rs:1812-1815` の Unknown ノード fallback でデータロス

```rust
_ => JsExpr::Raw(CompactString::from(format!("/* Unknown: {} */", node_type)))
```

TSAsExpression、TSTypeAssertion などが流入すると **silent に壊れた出力**になる。即時の対応として、`from_value()` の `_ =>` を `panic!` または `Result::Err` に変更し、漏れたノード型をスナップショットテストで早期検出可能にする。

#### **F3 (Major)**: CSS AST の typed 化（独立に修正可能）

`css/analyze.rs` の 36 件の `value.get("type").and_then(...)` ディスパッチを typed match に置換。CSS は他フェーズと結合度が低く、リスク低の独立タスク。Pass B の推奨順序: **これを最初に着手** → 学習効果と勝ちパターンを得てから typed_expr.rs リファクタへ。

#### **F4-F5 (Major)**: `scope_builder.rs:1695, 1718, 1735, 1745` の Raw 再ラップ + `expression.rs` のパターン変換器

`convert_binding_pattern_for_param()` 等 4 関数が `Value` を返すため、scope_builder が typed JsNode を `Raw` で再ラップするアンチパターン。`expression.rs` 側の修正が前提となる連鎖。

#### **F-MAJOR**: `scope_builder.rs:4897` でテストが無効化されている（OXC 0.107 互換性）

```
TODO: Re-enable tests after fixing Expression clone issue with OXC 0.107
```

binding 検出のユニットテストが無効化されている。fixture テストでカバーはされているが、**回帰検出の遅延**につながる。OXC 側の Expression Clone 実装を待つか、テストを clone 不要な書き方に直す（Pass B B4 によると 15-20 行の作業）。

### 3-2. クラスタ B2: SSR 割り当てホットスポット

**対象**: `3_transform/server/build.rs`（**7,144 LOC**）、`transform_script.rs`、`server/visitors/shared/utils.rs`、`server/helpers.rs`

#### **F6 (Major)**: `server/build.rs` の `format!()` 507 件 — 250 件は hot loop

特に集中している箇所:
- 2528-2531: `format!("${{$.escape({})}}", e)` パターン（**50+ 回登場**）
- 2579-2599: HTML push シーケンス内の `format!`（100+ 件）
- 4264-4336: each-block code generation 内の `format!`（15+ 件）

**重要**: 公式 JS 版も同様にテンプレートリテラルで頻繁に文字列を作る設計。rsvelte の `format!` は **JS パターンの忠実翻訳**であり、JS が GC で隠している割り当てを明示化したもの。設計バグではないが、Rust では `write!(buffer, ...)` パターンで再利用される `String` バッファに書き出す方が高速。

**修正方針**:
1. `CodeGenBuffer` ラッパー型を導入し、内部で `String` バッファを再利用
2. 反復頻度の高いテンプレ（`html_push_pattern`、`indent_block_pattern`、`escape_expr_pattern`）をヘルパー関数化
3. 推定 250 件のホット `format!` を `write!` に置換

期待効果: codegen 部分で 10〜15% の速度向上（SSR 全体では 2〜3% 程度の見込み）。

#### **F7 (Minor)**: `server/build.rs` のクローン 124 件（多くは「借用チェッカ回避型」）

特に再帰的ブロックビルダ（`build_if_statement`、`build_each_block_inner`）が `String` を所有で受け渡しており、`&str` / `&[OutputPart]` に変えれば 30 件程度削減可能。

#### **F8 (Major)**: SSR 関連 4 ファイル合計 13,798 LOC で **インライン unit テスト 0 件**

fixture-driven テストでカバーされているとはいえ、回帰検出の遅延と局所化困難の温床。Pass B の推奨は visitor メソッドからの純粋関数の抽出 + 5〜10 個のターゲット test 追加（15-30 person-days）。

### 3-3. クラスタ B3: クライアント変換クローン集中域

**対象**: `bind_directive.rs`（**132 clones、43 format!**）、`expression_utils.rs`、`state_transforms.rs`、`props_transforms.rs`

#### **F9 (Major)**: `bind_directive.rs` の `format!` 30 件が `JsExpr::Raw` を生成

```rust
format!("{}.{} = $$value, {}", ..., ..., ...)
// → JsStatement::Raw(CompactString::from(format!(...)))
```

これは **anti-pattern**: 型化された builder（`b::arrow()`、`b::sequence()`、`b::member()`、`b::assignment()`）を使うべき。型安全性を捨てて `Raw` で文字列構築している。約 20 件の `format!` を builder に置換可能。

#### **F10 (Major)**: `props_transforms.rs` の `to_string()` ラウンドトリップ

`transform_prop_reads_in_expr()` などが `&str` を受け取り、文字列を char-by-char でパースして識別子置換。本来は typed `JsExpr` を受け取って `expr.contains_identifier(name)` で判定すべき。8〜10 箇所が `JsExpr` walker メソッドの追加で解消可能（Pass B B3 で確認済み）。

#### **F11 (Minor)**: bind_directive のクローン 132 件

うち 5 件は **必要**（getter/setter の `SequenceExpression` から両半分を取り出す）、25-30 件は **closure capture** で borrow checker 回避型、40-50 件は **builder API が `JsExpr` 値渡しなので参照渡しに変えれば削減可能**。

### 3-4. クラスタ B4: 機能未完成エリア

#### **F12 (Major)**: `2_analyze/blockers.rs:184` で `$effect` 検出が欠落

```rust
// TODO: Check for $effect rune
```

reactive blocker 解析で **すべての CallExpression が write 候補として扱われる**。`$effect()` は async 完了後に走るので blocker から除外すべきだが、現状は除外されない。

**影響**: `$effect` を使う Svelte 5 コードで、不要な async 待ちが発生する可能性。

**修正コスト**: 10〜15 行（callee 名チェック）。**最も費用対効果の高い修正**の一つ。

#### **F13 (Major)**: `visitors/shared/snippets.rs:20, 88` でスニペット重複検出が欠落

`{#snippet card(...)}` を同名で 2 回定義しても rsvelte は警告/エラーなしで通す（後勝ち）。validator にも検出ロジック未実装。Svelte 5 で snippet を活用するユーザーで影響あり。

**修正コスト**: 20〜30 行（scope ごとの名前管理 + visitor pass で検証）。

#### **F14 (Minor)**: `transform_async.rs:126` の `todo!()` は **現状未到達**（dead code）

`create_thunk` を呼ぶパスが現コードベース中に存在しない。実際の async 変換は `async_body.rs` の正規表現ベース文字列分割で実施されている。**即時バグではない**が、放置すると将来の AST ベース移行時に踏む。

#### **F15 (Minor)**: `1_parse/estree_compat/expression.rs:248-354` の 11 種類 `TODO`

`MetaProperty`、`ClassExpression` 等の estree 互換変換が未実装。estree_compat は **コンパイルパスでは使われていない**（snapshot テスト / 開発ツール経由のみ）ため、コンパイル動作には影響しない。

### 3-5. クラスタ B5: 境界モジュール（legacy + svelte2tsx）

#### **F16 (Major)**: `svelte2tsx/magic_string.rs:305` の `split_at()` パニックが debug-only assert でしかガードされていない

```rust
// magic_string.rs:305
None => panic!("split_at({}): position out of range [0, {})", index, ...),
```

呼び出し元（`overwrite()` 等）に **debug-only `assert!`** はあるが、release ビルドでは外れる。AST パーサが範囲外位置を生成すると panic で落ちる。**ユーザー入力を含む Svelte コードから到達可能**な経路。

**推奨**: `split_at()` を `Result<usize, MagicStringError>` に変更し、`overwrite()` 等の呼び出し元でエラー伝播。または `assert!` を runtime check (`if ... { return Err(...) }`) に昇格。

#### **F17 (Minor)**: `legacy.rs` の `serde_json` 230 件は **すべて妥当**

Pass B B5 の精査結果、`legacy.rs` は Svelte 4 互換 AST 出力のための pure shim で、JSON は適切な I/O 媒体。**hot path 上ではない**。230 件はすべて正当。

ただし `legacy.rs:241, 249` の `as_object_mut().unwrap()` は **設計のロス感**: `convert_script()` が `Value` を返すが内容は常に object。`Map` を返すように変えれば unwrap 不要（小規模リファクタ）。

#### **F18 (Minor)**: `svelte2tsx` の unwrap 28 + 20 + 18 = 66 件、うち約 40 件は production

ほぼすべてはガード済み（`is_some()` / `is_empty()` チェック後）。**SUSPICIOUS** が 15 件、**DANGEROUS** に分類された 1 件は誤検出。テスト経由で通っているなら緊急ではないが、`expect("...")` で文脈を残す方が望ましい。

---

## 4. 機械的に低リスクで対応可能な改善

これらは **振る舞い変更ゼロ** で性能・保守性が向上するため、即時着手可能:

### 4-1. `std::HashMap` / `HashSet` → `FxHashMap` / `FxHashSet` 置換（23 箇所）

| File | Line(s) |
|------|---------|
| `2_analyze/css_scoping.rs` | 1175, 1530 |
| `2_analyze/types.rs` | 203 |
| `2_analyze/visitors/mod.rs` | 568 |
| `3_transform/client/mod.rs` | 2048-2049, 3397, 3420 |
| `3_transform/client/formatting.rs` | 1558 |
| `3_transform/client/visitors/bind_directive.rs` | 1180 |
| `3_transform/client/visitors/shared/utils.rs` | 2236 |
| `3_transform/shared/async_body.rs` | 2127, 2261 |
| `3_transform/server/transform_script.rs` | 17, 30, 36 |
| `3_transform/server/transform_legacy.rs` | 672, 776 |
| `3_transform/server/visitors/shared/element.rs` | 111 |

`rustc_hash` クレートはすでに依存に含まれている（`Cargo.toml` の `rustc-hash = "2.0"`）。識別子・短文字列キーで 2-3 倍速。

### 4-2. `arena.rs` の per-block SAFETY コメント追加（11 箇所）

§2 M-AST-1 参照。テンプレ化したテキストで対応可能、30 分〜1 時間。

### 4-3. `Cargo.toml` の crate-type 警告解消

```toml
# 現状
[lib]
crate-type = ["cdylib", "rlib"]
# → output filename collision warning

# 推奨
[lib]
crate-type = ["cdylib", "lib"]
```

---

## 5. 推奨アクション（優先順）

### Tier 1: 即時着手すべき修正（半日〜1 日）

1. **`magic_string.rs:305` を `Result` 化**（F16）— ユーザー入力経由 panic を排除。
2. **`blockers.rs:184` の `$effect` 検出追加**（F12）— 10〜15 行、Svelte 5 ユーザーへの影響大。
3. **`visitors/shared/snippets.rs` 重複検出追加**（F13）— 20〜30 行、Svelte 5 snippet ユーザーへの影響大。
4. **23 箇所の `HashMap`/`HashSet` を `FxHashMap`/`FxHashSet` に置換**（§4-1）— 振る舞い変更なし。
5. **`arena.rs` 11 箇所に SAFETY コメント追加**（§4-2）— ドキュメント改善のみ。

### Tier 2: 中期的構造改善（1〜2 週間）

6. **CSS AST の typed 化**（F3）— `src/ast/css.rs` に typed enum を整備し `2_analyze/css/analyze.rs` を typed match に書き換え。**CSS は他フェーズと結合度が低いので独立に修正可能、`JsNode::Raw` 廃止計画の最初の試金石として最適**。
7. **`expression.rs` の comment attachment 修正**（F1）— JsNode の statement variant に `leading_comments` フィールド追加。`Raw` 化されるステートメントの ~50% を削減。
8. **`from_value()` の `_ =>` フォールバック厳密化**（F2）— Unknown ノードを `panic!` または `Result::Err` に。データロスを早期検出。
9. **`EachBlock.context` を `Option<Pattern>` に修正**（C-AST-2）— downstream 影響を確認しながら型整合。

### Tier 3: 中期〜長期構造改善（1〜2 ヶ月）

10. **TS 専用バリアントの追加**（`TSAsExpression`、`TSTypeAssertion`、`TSParameterProperty`）+ `convert_binding_pattern_*` の typed 化。これにより `scope_builder.rs` と `expression_converter.rs` の Raw 経由経路が大幅減少。
11. **`JsNode::Raw` バリアントの廃止**（最終ゴール）— 上記すべてが揃った後。
12. **`Expression::Lazy` の type-state 化**（C-AST-3）— Phase 1 → 2 境界 API の改修込み。8 箇所の panic を完全削除。

### Tier 4: 性能最適化（計測ベース）

13. **`server/build.rs` の `format!` ホットループを `write!` に置換**（F6）— 250 箇所。`CodeGenBuffer` ラッパー導入。
14. **`bind_directive.rs` の `format!` → typed builder 置換**（F9）— 20 箇所。型安全性向上 + 性能改善。
15. **`props_transforms.rs` の `to_string()` ラウンドトリップ削除**（F10）— `JsExpr::contains_identifier()` メソッド追加。

### Tier 5: テストカバレッジ補強（任意）

16. **SSR 関連 4 ファイル（13,798 LOC、unit テスト 0）にターゲットテスト追加**（F8）。まずは visitor メソッドからの純粋関数抽出。
17. **`scope_builder.rs:4897` の無効化テスト復活**（OXC clone 不要な書き方に変更、または OXC アップグレード待ち）。

### Tier 6: 環境改善（コードレビュー範囲外だが報告）

18. **`cargo clean && cargo build --release` で test_reporter 等の bin リンク失敗を解消**（macOS バージョンミスマッチによる prebuilt rlib の不整合）。
19. **`Cargo.toml` の `crate-type = ["cdylib", "rlib"]` を `["cdylib", "lib"]` に**（§4-3）。

---

## 6. 申し送り事項 — コードオーナーへ

### 良い点（特筆）

- **公式 Svelte 互換性 100% 達成**は本当にすごい成果です。
- **clippy / fmt がクリーン**な状態で 230k LOC を維持しているのも素晴らしい。
- **構造的整合性**（公式コンパイラとのファイル/ディレクトリ対応）も適切に保たれている。
- **rsvelte 独自モジュール（11 件）はすべて妥当**。OXC 連携や Rust モジュール性のための justified deviation。

### 注意すべき長期戦略

- **`JsNode::Raw` の存在が技術的負債の中核**です。140+ 箇所で消費されているため即時廃止は無理ですが、新しい AST 拡張時に「Raw 経由で済ます」誘惑が残り続けます。Tier 2 の F1（コメント attachment 修正）から着手して **「Raw を増やさない、減らす方向」を制度化** することを推奨します。

- **fixture-driven 100% パスは堅牢ですが、unit テストが薄い**ため、リファクタ時の回帰検出が遅れがち。Tier 5 のテスト補強は Tier 2-3 のリファクタの安全網として並走させると吉。

- **性能 100x 目標** に対して、`format!` / `clone()` の集中域（特に `server/build.rs`）は計測前提でも明らかなホットスポット。ベンチマークでベースラインを取ってから Tier 4 に着手するのを推奨します。

### 私が触っていない領域

- `tests/` 配下のテストコード自体の品質（コードレビュー対象外として扱いました）
- `fixtures/` 配下（自動生成）
- `svelte/`、`vite-plugin-svelte/`、`language-tools/` サブモジュール（外部由来）
- `docs/` 配下（生成物）
- `node_modules/`
- `compat-targets/`（untracked、PR ブランチでない）

### 検証成果物の保存場所

- `.review-artifacts/pass-a-findings.md` — Pass A 全 7 並列スキャンの集約結果（生データに近い）
- `.review-artifacts/phase-3-ast-findings.md` — AST 精読レビューの検証済み所見

これらは中間データなので、本レポート（`REVIEW_REPORT.md`）の方が priorities にフォーカスしています。詳細を追いたい場合のみ参照してください。

### 私のコード変更について

**コード変更は一切していません**。レビュー結果と推奨アクションをドキュメント化したのみです。理由:

1. ユーザー就寝中で承認が得られないため、修正は控えるべき
2. Tier 1 の機械的修正（HashMap → FxHashMap、SAFETY コメント追加など）は安全だが、それでも振る舞い検証 + コミット粒度の判断を要する
3. レビュー作業の本質は「課題発見と整理」であり、修正は別タスク

朝起きて本レポートをレビューした上で、どこから着手するか相談しましょう。

---

レビュー作業時間: 約 90 分（並列 Agent 12 個、深掘り Agent 6 個）。
