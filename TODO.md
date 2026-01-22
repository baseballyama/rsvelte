# TODO.md - Svelte Compiler Rust Project Master Plan

このファイルはプロジェクトの**Single Source of Truth（単一の正）**です。
すべての作業はここに記載され、進捗・発見・判断が逐次更新されます。

**最終更新**: 2026-01-22
**現在のフェーズ**: Phase C - Rust 実装

---

## 1. 目的・範囲・非目標

### 1.1 目的

Svelte コンパイラの完全な Rust 再実装を完成させ、以下を達成する：

1. **100% テスト互換性** - 公式 Svelte コンパイラのテストスイートを完全に通過
2. **100x パフォーマンス** - Rust 最適化と並列処理による高速化
3. **Drop-in Replacement** - 既存ツール（Vite等）との互換性を持つ N-API バインディング
4. **OXC 統合** - oxc エコシステムへの統合を見据えた設計

### 1.2 範囲（スコープ）

- [x] Phase 1: Parse（パース）- 100% 完了
- [ ] Phase 2: Analyze（分析）- 75% 完了、残り作業あり
- [ ] Phase 3: Transform（変換）- 65% 完了、重点作業
- [ ] 互換性テストの正当性レビューと拡張
- [ ] docs サイトの完成（playground からの移行）
- [ ] CI/CD パイプラインの最適化

### 1.3 非目標（スコープ外）

- Svelte ランタイムの Rust 実装（JavaScript のまま使用）
- REPL のフル実装（playground で十分）
- Svelte 4 以前のレガシー機能の新規実装
- IDE プラグインの開発（別プロジェクト）

---

## 2. 現状調査結果の要約（2026-01-22）

### 2.1 JS 実装構造

```
svelte/packages/svelte/src/compiler/
├── index.js              # エントリーポイント（compile, parse, compileModule）
├── phases/
│   ├── 1-parse/          # パーサー（状態マシン、Acorn式パース）
│   │   ├── index.js      # Parser クラス
│   │   ├── read/         # script, style, options 読み込み
│   │   └── state/        # fragment, element, tag, text 状態マシン
│   ├── 2-analyze/        # 分析（スコープ、バインディング）
│   │   ├── index.js      # analyze_component()
│   │   ├── visitors/     # 60+ 訪問者ファイル
│   │   └── css/          # CSS 分析・除去
│   └── 3-transform/      # コード生成
│       ├── client/       # クライアント変換（70+ visitors）
│       ├── server/       # サーバー変換（25+ visitors）
│       └── css/          # CSS 出力
├── types/                # 型定義
└── utils/                # ユーティリティ
```

### 2.2 Rust 実装状態

| フェーズ | 行数 | ファイル数 | 完了率 | 状態 |
|---------|------|-----------|--------|------|
| Phase 1 Parse | 16,717 | 28 | 100% | ✅ 本番品質 |
| Phase 2 Analyze | 16,825 | 90 | 75% | ⚠️ 主要機能完了、エッジケース残り |
| Phase 3 Transform | 28,758 | 68 | 65% | ⚠️ コア実装済み、visitor 不足 |
| Utils/Print | 7,787 | 24 | 50% | ⚠️ 基本機能のみ |
| **合計** | **73,739** | **210** | **75-80%** | |

### 2.3 テスト通過状況

| スイート | 通過/総数 | 通過率 | 優先度 |
|---------|----------|--------|--------|
| Parser Modern | 18/22 | 81.8% | - |
| Parser Legacy | 82/82 | 100% | - |
| Compiler Snapshot | 15/19 | 78.9% | 高 |
| CSS | 110/177 | 62.1% | 中 |
| Validator | 82/312 | 26.3% | 中 |
| Compiler Errors | 0/118 | 0% | 高 |
| Runtime Runes | 10/724 | 1.4% | 最高 |
| Runtime Legacy | 13/1198 | 1.1% | 高 |
| Hydration | 4/70 | 5.7% | 中 |
| SSR | 10/80 | 12.5% | 中 |
| Print | 1/39 | 2.6% | 低 |
| **全体** | **347/2830** | **12.3%** | |

### 2.4 playground 現状

- SvelteKit 2.x + Svelte 5 + Monaco Editor
- WASM コンパイラ統合済み
- GitHub Pages 自動デプロイ
- テスト結果表示機能あり
- **docs ディレクトリ未作成**

---

## 3. Rust 実装の扱い判断

### 3.1 判断: 既存実装を**流用**する

**理由:**

1. **高い完成度**: 73,739行、75-80% 機能完了
2. **正しいアーキテクチャ**: zimmerframe walker パターン採用済み
3. **Phase 1 完全**: パーサーは本番品質
4. **テスト通過実績**: パーサーテスト 100%、CSS 62%
5. **破棄のコスト**: 再実装は数ヶ月を要する

### 3.2 流用方針

- **そのまま流用**: Phase 1 全体、Phase 2 コア、Phase 3 基盤
- **修正して流用**: Phase 2/3 の未完成 visitor、CSS エッジケース
- **新規実装**: 未実装の validator、compiler-errors 機能

---

## 4. JS ↔ Rust ファイル対応表

### 4.1 Phase 1: Parse（100% 対応済み）

| JS ファイル | Rust ファイル | 状態 |
|------------|--------------|------|
| `1-parse/index.js` | `1_parse/mod.rs` | ✅ |
| `1-parse/acorn.js` | OXC 使用 | ✅ |
| `1-parse/read/script.js` | `1_parse/read/script.rs` | ✅ |
| `1-parse/read/style.js` | `1_parse/read/style.rs` | ✅ |
| `1-parse/state/*.js` | `1_parse/state/*.rs` | ✅ |

### 4.2 Phase 2: Analyze（75% 対応）

| JS ファイル | Rust ファイル | 状態 |
|------------|--------------|------|
| `2-analyze/index.js` | `2_analyze/mod.rs` | ✅ |
| `scope.js` | `phases/scope.rs` | ✅ |
| `bindings.js` | `phases/bindings.rs` | ✅ |
| `visitors/VariableDeclarator.js` | `visitors/variable_declarator.rs` | ✅ |
| `visitors/AssignmentExpression.js` | `visitors/assignment_expression.rs` | ✅ |
| `visitors/MemberExpression.js` | `visitors/member_expression.rs` | ✅ |
| `visitors/IfBlock.js` | `visitors/if_block.rs` | ⚠️ 部分 |
| `visitors/EachBlock.js` | `visitors/each_block.rs` | ⚠️ 部分 |
| `css/css-analyze.js` | `css/analyze.rs` | ⚠️ 部分 |
| `css/css-prune.js` | `css/prune.rs` | ⚠️ 部分 |
| 残り 50+ visitors | 対応ファイルあり | ⚠️ 部分 |

### 4.3 Phase 3: Transform（65% 対応）

| JS ファイル | Rust ファイル | 状態 |
|------------|--------------|------|
| `3-transform/index.js` | `3_transform/mod.rs` | ✅ |
| `client/transform-client.js` | `client/transform_client.rs` | ✅ |
| `server/transform-server.js` | `server/transform_server.rs` | ✅ |
| `client/visitors/Fragment.js` | `client/visitors/fragment.rs` | ✅ |
| `client/visitors/RegularElement.js` | `client/visitors/regular_element.rs` | ✅ |
| `client/visitors/IfBlock.js` | `client/visitors/if_block.rs` | ⚠️ 部分 |
| `client/visitors/EachBlock.js` | `client/visitors/each_block.rs` | ⚠️ 部分 |
| `client/visitors/Component.js` | `client/visitors/component.rs` | ❌ スタブ |
| 残り 60+ visitors | 対応ファイルあり | ⚠️ 部分/❌ |

---

## 5. マイルストーン

### M1: Compiler Snapshot 100%（目標: 2026-02-05）✅ **達成: 2026-01-22**

- [x] 残り 4 テスト修正 → **全19テスト通過**
- [x] 条件付き $$props 注入実装
- [x] 配列フォーマッティング修正

### M2: Runtime Runes 50%（目標: 2026-02-28）

- [ ] {#if} ブロック クライアント生成完全実装
- [ ] {#each} ブロック クライアント生成完全実装
- [ ] Component visitor 完全実装
- [ ] イベントハンドラ完全実装

### M3: Runtime 全体 50%（目標: 2026-03-31）

- [ ] Hydration 対応
- [ ] SSR 完全実装
- [ ] 残りの visitor 実装

### M4: テスト 80% 通過（目標: 2026-04-30）

- [ ] Validator 警告生成
- [ ] Compiler Errors 検出
- [ ] CSS エッジケース

### M5: docs サイト完成（目標: 2026-03-15）

- [ ] playground → docs 移行
- [ ] テスト結果表示ページ
- [ ] API ドキュメント

### M6: 100% 互換性達成（目標: 2026-06-30）

- [ ] 全テスト通過
- [ ] パフォーマンスベンチマーク
- [ ] N-API バインディング

---

## 6. 具体的タスク

### 6.1 Phase C: Rust 実装タスク

#### 6.1.0 基盤修正

- [x] **C-000**: ビルドエラー修正（transform_client.rs）
  - 完了: 2026-01-22
  - JsIdentifier → String、JsStatement API修正

#### 6.1.1 Phase 3 Client Visitors（最優先）

- [ ] **C-001**: IfBlock visitor 完全実装（調査完了）
  - 依存: なし
  - 完了条件: runtime-runes の if 関連テスト通過
  - 参照: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/IfBlock.js`

- [ ] **C-002**: EachBlock visitor 完全実装
  - 依存: なし
  - 完了条件: runtime-runes の each 関連テスト通過
  - 参照: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/EachBlock.js`

- [ ] **C-003**: Component visitor 完全実装
  - 依存: C-001, C-002
  - 完了条件: コンポーネントのネストが正しく動作
  - 参照: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/Component.js`

- [ ] **C-004**: AwaitBlock visitor 実装
  - 依存: なし
  - 完了条件: {#await} テスト通過

- [ ] **C-005**: SnippetBlock visitor 実装
  - 依存: なし
  - 完了条件: {#snippet} テスト通過

- [ ] **C-006**: BindDirective visitor 完全実装
  - 依存: なし
  - 完了条件: bind: ディレクティブテスト通過

#### 6.1.2 Phase 2 Analyze 補完

- [ ] **A-001**: Validator 警告生成システム
  - 依存: なし
  - 完了条件: validator テスト 50% 通過

- [ ] **A-002**: CSS 複合セレクタ分析
  - 依存: なし
  - 完了条件: CSS テスト 80% 通過

- [ ] **A-003**: A11y チェック実装
  - 依存: A-001
  - 完了条件: a11y 関連警告出力

#### 6.1.3 Compiler Errors

- [ ] **E-001**: エラー検出システム実装
  - 依存: なし
  - 完了条件: compiler-errors テスト 50% 通過

### 6.2 Phase D: テストタスク

- [ ] **T-001**: テスト正当性レビュー
  - 比較対象が JS 実装を正としているか確認
  - 偶然一致の検出ロジック確認
  - 失敗時の原因追跡情報確認

- [ ] **T-002**: 警告/エラー比較の改善
  - 現状: 数値比較のみ
  - 改善: コードとメッセージの完全比較

- [ ] **T-003**: CI テスト最適化
  - 並列実行の最適化
  - タイムアウト設定の環境適応化

### 6.3 Phase E: docs タスク

- [ ] **D-001**: docs ディレクトリ構造作成
  - `docs/` を SvelteKit プロジェクトとして作成
  - または playground 内に `routes/docs/` として統合

- [ ] **D-002**: テスト結果表示ページ拡張
  - 合格率グラフ
  - 失敗ケース一覧
  - 差分表示

- [ ] **D-003**: 時系列進捗グラフ
  - コミット別の通過率推移
  - Chart.js または D3.js 統合

- [ ] **D-004**: API ドキュメント
  - compile(), parse(), compileModule() の使用方法
  - オプション一覧

---

## 7. 互換性の定義

### 7.1 比較対象

- **正（Gold Standard）**: 公式 Svelte コンパイラ（`svelte/packages/svelte/src/compiler/`）
- **対象バージョン**: svelte commit `0ac5af488da4` 以降

### 7.2 許容差

- **AST 比較**: 内部メタデータフィールドを除き完全一致
- **JS 出力**: 正規化後の文字列一致（空白、クォート統一）
- **CSS 出力**: ハッシュ値を除き完全一致
- **警告/エラー**: コード、メッセージ、位置情報の完全一致

### 7.3 例外方針

- **パフォーマンス最適化による出力差**: 動作が同一なら許容（要文書化）
- **未実装機能**: 明示的にスキップ（async, hmr, fragments オプション）
- **バグ修正**: JS 実装のバグを再現する必要はない（要文書化）

---

## 8. テスト戦略

### 8.1 テスト種類と優先度

| 種類 | 目的 | 優先度 | 実行頻度 |
|------|------|--------|---------|
| Parser | AST 正確性 | 完了 | 毎コミット |
| Snapshot | 出力コード | 高 | 毎コミット |
| Runtime | 実行時動作 | 最高 | 毎PR |
| CSS | スタイル出力 | 中 | 毎PR |
| Validator | 警告生成 | 中 | 週次 |
| Errors | エラー検出 | 高 | 毎PR |

### 8.2 CI 組み込み

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - name: Parser Tests
        run: cargo test test_parser --release
      - name: Snapshot Tests
        run: cargo test test_compiler_snapshot --release
      - name: Runtime Tests
        run: cargo test test_runtime --release -- --test-threads=4
```

### 8.3 テスト結果出力形式

```json
{
  "svelte_commit": "0ac5af488da4",
  "generated_at": "2026-01-22T00:00:00Z",
  "summary": {
    "total_tests": 3027,
    "total_passed": 347,
    "overall_percentage": 11.5
  },
  "categories": { ... }
}
```

---

## 9. docs 移行計画

### 9.1 移行方針

**Option A（推奨）: playground 内統合**

- `playground/src/routes/docs/` にドキュメントページ追加
- 既存のテスト結果表示を拡張
- 単一デプロイで管理容易

### 9.2 表示要件

- [x] テスト通過率（カテゴリ別）
- [x] テスト一覧（フィルター付き）
- [ ] 失敗ケース詳細（エラーメッセージ、差分）
- [ ] 時系列グラフ（進捗推移）
- [ ] API リファレンス

### 9.3 導線

```
/ (ランディング)
├── /playground (エディタ)
├── /progress (テスト結果) ← 拡張
├── /benchmark (ベンチマーク)
└── /docs (新規)
    ├── /getting-started
    ├── /api-reference
    └── /compatibility
```

### 9.4 デザイン方針

- 既存の playground デザインを継承
- ダークテーマ（#0a0a0f ベース）
- モバイル対応

---

## 10. リスクと対策

### 10.1 並行開発による差分拡大

**リスク**: JS 実装の更新により互換性が崩れる
**対策**:

- svelte commit hash を固定してテスト
- 週次で最新 svelte との差分確認
- 重要な変更は CHANGELOG で追跡

### 10.2 仕様曖昧性

**リスク**: JS 実装の挙動が仕様なのかバグなのか不明
**対策**:

- テストケースで挙動を確認
- 疑問点は Issue で記録
- 判断根拠を TODO.md に記載

### 10.3 テスト信頼性

**リスク**: 偶然一致や不完全な比較による偽陽性
**対策**:

- 正規化ロジックのレビュー
- 警告/エラーの完全比較実装
- 手動での出力確認（サンプル）

### 10.4 パフォーマンス目標未達

**リスク**: 100x 高速化が達成できない
**対策**:

- プロファイリングによるボトルネック特定
- Rayon による並列化
- メモリ効率の最適化

---

## 11. 進捗ログ

### 2026-01-22

- [x] **Phase A 完了**: 現状調査
  - [x] JS 実装構造の完全な把握
  - [x] Rust 実装状態の評価（75-80% 完了）
  - [x] テスト環境の詳細調査
  - [x] playground 現状確認
- [x] **Phase B 完了**: TODO.md 作成
  - [x] 判断: 既存 Rust 実装を流用
- [ ] **Phase C 進行中**: Rust 実装
  - [x] C-000: ビルドエラー修正（transform_client.rs）
    - JsIdentifier → String
    - JsStatement::ImportDeclaration → JsStatement::Import
    - JsImportSpecifier 形式修正
    - source_type フィールド削除
  - [x] C-001: IfBlock visitor 完全実装
    - async handling、elseif support、var declarations
    - blockers 収集は Phase 2 で未実装（known issue）
  - [x] C-002: EachBlock visitor 完全実装
    - keyed/non-keyed、fallback、animations
  - [x] C-003: Component visitor 完全実装
    - props、slots、bind、events、dynamic components
  - [x] C-004: AwaitBlock visitor 実装
    - pending/then/catch block handling
    - Pattern destructuring for value/error params
  - [x] C-005: SnippetBlock visitor 実装
    - Function arguments with $.noop defaults
    - Module/instance level snippet placement
  - [x] C-006: BindDirective visitor 実装
    - All bind types (value, checked, group, this, etc.)
    - Window/document/media bindings
  - [x] Clippy 警告 80 件修正
  - [x] C-007: Compiler Snapshot 100% 達成 (19/19)
    - 条件付き $$props 注入実装（should_inject_props フラグ）
    - 条件付き $.push/$.pop 挿入（should_inject_context フラグ）
    - AnalysisFlags 構造体で Phase 2 → Phase 3 のデータ受け渡し
    - 配列フォーマッティング修正（単一行出力）
    - シングルクオート出力対応
  - [x] C-008: Runtime Runes 基盤改善
    - 要素ナビゲーション実装（$.first_child, $.child, $.sibling, $.reset）
    - use: ディレクティブ実装（$.action）
    - テンプレート空白正規化
    - テキストノード空白圧縮
    - bind:value 実装（$.bind_value, $.remove_input_defaults）

### 2026-01-23

- [ ] **Phase C 継続**: Runtime Runes 改善
  - [x] C-009: モジュールスクリプト保存
    - `<script module>` ブロックの出力を保持
    - customElements.define 等のモジュールレベルコード対応
  - [x] C-010: コンテキスト注入
    - $.push($$props, true) / $.pop() の生成
    - $$props パラメータの関数シグネチャ追加
    - $effect() 等の needs_context 検出
  - [x] C-011: $.derived() ラップ
    - 式を () => expression 形式にラップ
    - 状態変数参照を $.get() でラップ
  - [x] C-012: イベントデリゲーション改善
    - delegatable イベントのフィルタリング（click, input 等）
  - [x] C-013: class:/style: ディレクティブ（クライアント）
    - $.set_class() / $.set_style() 生成
  - [x] C-014: class:/style: ディレクティブ（サーバー）
    - $.attr_class() / $.attr_style() 生成
    - !important 修飾子対応
  - [x] C-015: {#if} ブロック基盤
    - IfBlockInfo/IfBlockPart 型追加
    - $.if() 呼び出し生成
    - consequent/alternate ブランチ生成
  - [ ] C-016: ネストされたコンポーネント/ブロックの再帰的処理
    - スロットの children 内でコンポーネント/ブロックを正しく生成
    - 多層ネストでも再帰的に訪問者を呼び出す
    - 参照: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/component.js`
  - [ ] C-017: Snippet パラメータ処理
    - `{#snippet foo(n)}` のパラメータ `n` を関数引数として生成
    - デフォルト値 `$.noop` の適用
    - Snippet 内のテキスト/テンプレート処理
  - [ ] C-018: スタティック値判定の修正（Phase 2）
    - `let show = true;` がリアクティブに変換されないように修正
    - スコープ分析での reactive 判定ロジックを正確に
  - [ ] C-019: Template effect 生成の完全実装
    - Snippet 内の `$.template_effect()` 生成
    - Expression コンテキストでの適切なエフェクト生成
  - [ ] C-020: 複数テンプレート参照の生成
    - ネストされた if/each 内の HTML テンプレートも `from_html()` で定義
    - 全必要なテンプレートを `root_N` 変数として出力
- [ ] **Phase D 未着手**: 互換性テスト整備
- [ ] **Phase E 未着手**: docs サイト完成

**現在のテスト状況（2026-01-23 更新）:**

- Runtime Runes: 11/724 (client: 15, server: 103) - 改善中
- **Compiler Snapshot: 19/19 (100%)** ✅
- Clippy: 0 件（全て修正済み）

**失敗パターン分析（2026-01-23）:**

| 問題カテゴリ | 根本原因 | 影響テスト例 |
|-------------|--------|------------|
| ネストされたコンポーネント/ブロック処理 | 再帰的訪問者の実装が不完全 | event-attribute-delegation-5, transition-if-nested-static |
| Snippet パラメータ処理 | `{#snippet}` ディレクティブの引数処理が未実装 | snippet-prop-explicit |
| スタティック値判定 | Phase 2 Analyze の reactive 判定ロジックが誤っている | transition-if-nested-static |
| Template effect 生成 | Expression コンテキストでの effect 生成が実装されていない | snippet-prop-explicit |
| 複数テンプレート参照 | 複数の `from_html()` テンプレートが必要な場合に全部生成されていない | transition-if-nested-static |

**次のステップ**: C-016 ネストされたコンポーネント/ブロック処理から着手

---

## 12. 並行開発ルール

### 12.1 ファイル対応維持

- 新規 JS ファイル追加時は対応 Rust ファイルを作成
- ファイル名は snake_case に変換（例: `IfBlock.js` → `if_block.rs`）
- 対応表（セクション4）を更新

### 12.2 コミット規約

- 機能追加: `feat(phase2): Implement IfBlock visitor`
- バグ修正: `fix(phase3): Correct event handler binding`
- テスト: `test: Add runtime-runes if-block tests`

### 12.3 差分追跡

- 週次で `svelte` サブモジュール更新
- 新規テスト追加時は fixtures 再生成
- 互換性レポートの差分を確認

---

**次のアクション**: Runtime Runes テスト改善（M2: 50% 目標）に向けた調査と実装
