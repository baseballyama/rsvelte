# svelte2tsx / svelte-check ネイティブ Rust 実装方針

## 1. 背景と目的

### 現状のアーキテクチャ

```
.svelte ファイル
    ↓
[svelte2tsx] svelte/compiler.parse() で AST 化 → MagicString で TSX に変換
    ↓
[TypeScript] LanguageService / tsc で型チェック
    ↓
[svelte-check] 診断結果をソースマップ経由で元のソース位置にマッピング
```

現在の language-tools は 4 つのパッケージで構成されている：

| パッケージ                 | 役割                                                           |
| -------------------------- | -------------------------------------------------------------- |
| **svelte2tsx**             | `.svelte` → `.tsx` 変換 + ソースマップ生成                     |
| **svelte-language-server** | LSP サーバー（SveltePlugin / CSSPlugin / TypeScriptPlugin）    |
| **svelte-check**           | CLI 型チェッカー（language-server を内部利用）                 |
| **typescript-plugin**      | TS Language Service Plugin（IDE 内で `.svelte` import を解決） |

### 目的

rsvelte コンパイラを活用し、以下を実現する：

1. **svelte2tsx の Rust ネイティブ実装** — パース + 変換を Rust で高速化
2. **svelte-check の高速化** — Rust 側で可能な処理をネイティブ化
3. **将来的な Language Server の高速化** への基盤構築

---

## 2. 現行実装の詳細分析

### 2.1 svelte2tsx の変換パイプライン

```
入力: Svelte ソースコード (string)
    ↓
[Phase 1] parse — svelte/compiler.parse() で Svelte AST を生成
    ↓
[Phase 2] スクリプト再配置 — module script → instance script → template の順に並べ替え
    ↓
[Phase 3] テンプレート変換 (htmlxtojsx_v2)
    - estree-walker で AST を走査
    - 各ノードタイプごとのハンドラで JSX に変換
    - MagicString でソース位置を保持
    ↓
[Phase 4] スクリプト変換
    - TypeScript compiler API で script を解析
    - export の追跡（ExportedNames）
    - イベントディスパッチャの抽出（ComponentEvents）
    - ストア使用の検出（$store → store 変換）
    - ジェネリクスの抽出
    ↓
[Phase 5] render 関数生成
    - テンプレートを $$render() 関数で包む
    - props / slots / events の型情報を返す
    ↓
[Phase 6] コンポーネント export 生成
    - __sveltets_2_createSvelte2TsxComponent を継承するクラスを生成
    - Svelte 5 + runes では簡略化されたアプローチ

出力: { code: string, map: SourceMap, exportedNames, events }
```

### 2.2 svelte2tsx のノードハンドラ一覧

テンプレート変換で使用されるハンドラ（`htmlxtojsx_v2/nodes/`）：

| ハンドラ                        | 変換内容                                    |
| ------------------------------- | ------------------------------------------- |
| Element                         | HTML 要素 → `svelteHTML.createElement(...)` |
| InlineComponent                 | Svelte コンポーネント → JSX                 |
| IfElseBlock                     | `{#if}` → `if/else` ブロック                |
| EachBlock                       | `{#each}` → ループ                          |
| AwaitPendingCatchBlock          | `{#await}` → Promise ハンドリング           |
| SnippetBlock                    | Svelte 5 `{#snippet}`                       |
| RenderTag                       | Svelte 5 `{@render}`                        |
| Binding                         | `bind:` → 双方向バインディング型情報        |
| EventHandler                    | `on:` → イベントリスナー型情報              |
| Attribute                       | 属性 → JSX 属性                             |
| MustacheTag                     | `{expr}` → 式展開                           |
| Action / Animation / Transition | ディレクティブ                              |
| Class / StyleDirective          | スタイルディレクティブ                      |

### 2.3 svelte-check の動作モード

**Traditional モード（デフォルト）:**

```
SvelteCheck → PluginHost → 3 つのプラグイン
├─ SveltePlugin: コンパイラ警告（A11y 等）
├─ CSSPlugin: 未使用 CSS セレクタ
└─ TypeScriptPlugin: svelte2tsx → TS LanguageService で型チェック
```

**Incremental モード（`--incremental` / `--tsgo`）:**

```
1. emitSvelteFiles() — 変更ファイルのみ svelte2tsx → .tsx + .d.svelte.ts をディスクに書き出し
2. writeOverlayTsconfig() — オーバーレイ tsconfig 生成
3. runTypeScriptDiagnostics() — tsc/tsgo サブプロセスで型チェック
4. mapCliDiagnosticsToLsp() — ソースマップで位置をマッピング
5. getSvelteDiagnosticsForIncremental() — Svelte/CSS 診断をマージ
```

### 2.4 typescript-plugin の仕組み

```
TypeScript Language Service
    ↓ (plugin として注入)
typescript-svelte-plugin
├─ Module Resolution: .svelte import の解決
├─ SvelteSnapshot: svelte2tsx で変換 + キャッシュ
├─ SourceMapper: 位置の双方向変換
└─ Language Service Decorators (18 個):
   completions, diagnostics, definition, hover,
   find-references, rename, call-hierarchy, etc.
```

---

## 3. 実装方針

### 3.1 段階的アプローチ

全体を一度に置き換えるのではなく、段階的に Rust 化を進める。

```
Phase A: svelte2tsx コア変換の Rust 実装
    ↓
Phase B: NAPI バインディングで既存 language-tools に統合
    ↓
Phase C: svelte-check の最適化（Incremental モード改善）
    ↓
Phase D: Language Server 統合（将来）
```

### 3.2 Phase A: svelte2tsx コア変換の Rust 実装

#### A-1. アーキテクチャ設計

既存の rsvelte コンパイラの Phase 1 (parse) と Phase 2 (analyze) を活用し、
TSX 出力生成器を新たに実装する。

```
src/compiler/phases/
├── 1_parse/         # 既存: Svelte → AST（再利用）
├── 2_analyze/       # 既存: スコープ解析（再利用）
├── 3_transform/     # 既存: JS/CSS コード生成
└── 4_svelte2tsx/    # 新規: AST → TSX 変換
```

#### A-2. 変換ロジックの実装

**テンプレート → TSX 変換:**

```rust
// 概念的な構造
pub struct Svelte2TsxResult {
    pub code: String,
    pub source_map: SourceMap,
    pub exported_names: ExportedNames,
}

pub fn svelte2tsx(source: &str, options: Svelte2TsxOptions) -> Result<Svelte2TsxResult> {
    // 1. rsvelte の parse() で AST 生成（既存）
    let ast = parse(source, parse_options)?;

    // 2. rsvelte の analyze() でスコープ解析（既存）
    let analysis = analyze(&ast, analyze_options)?;

    // 3. TSX コード生成（新規）
    let tsx = generate_tsx(&ast, &analysis, &options)?;

    Ok(tsx)
}
```

**ソースマップ生成:**

- JS の MagicString に相当する仕組みが必要
- Rust には `sourcemap` crate があるが、位置保持型の文字列操作には独自実装が必要
- 方針: `TextChange` のリスト（位置、削除範囲、挿入テキスト）を管理し、最終的にソースマップを生成

```rust
pub struct MagicString {
    original: String,
    changes: Vec<TextChange>,
}

impl MagicString {
    pub fn overwrite(&mut self, start: u32, end: u32, content: &str);
    pub fn prepend(&mut self, content: &str);
    pub fn append(&mut self, content: &str);
    pub fn remove(&mut self, start: u32, end: u32);
    pub fn generate_map(&self) -> SourceMap;
    pub fn to_string(&self) -> String;
}
```

#### A-3. テンプレートノードハンドラの実装

JS 版の `htmlxtojsx_v2/nodes/` に対応する Rust モジュールを作成：

```
src/compiler/phases/4_svelte2tsx/
├── mod.rs                    # エントリポイント
├── magic_string.rs           # MagicString 相当
├── template/
│   ├── mod.rs
│   ├── element.rs            # HTML 要素
│   ├── component.rs          # Svelte コンポーネント
│   ├── if_block.rs           # {#if}
│   ├── each_block.rs         # {#each}
│   ├── await_block.rs        # {#await}
│   ├── snippet_block.rs      # {#snippet}
│   ├── render_tag.rs         # {@render}
│   ├── binding.rs            # bind:
│   ├── event_handler.rs      # on:
│   ├── attribute.rs          # 属性
│   ├── mustache_tag.rs       # {expr}
│   ├── action.rs             # use:
│   ├── transition.rs         # transition:/in:/out:
│   ├── class_directive.rs    # class:
│   └── style_directive.rs    # style:
├── script/
│   ├── mod.rs
│   ├── exported_names.rs     # export 追跡
│   ├── stores.rs             # $store 変換
│   ├── generics.rs           # ジェネリクス抽出
│   └── component_events.rs   # イベント抽出
├── render_function.rs        # $$render() 生成
└── component_export.rs       # default export 生成
```

#### A-4. TypeScript AST 解析の代替

現行の svelte2tsx は `<script>` ブロックの解析に TypeScript compiler API を使用している。
Rust 側では OXC の TypeScript パーサーを活用する。

```rust
// OXC で script ブロックを解析
use oxc_parser::Parser;
use oxc_ast::ast::*;

fn analyze_script(script_content: &str) -> ScriptAnalysis {
    let parsed = Parser::new(script_content, SourceType::tsx()).parse();
    // export, store usage, generics, event dispatcher を抽出
    walk_script_ast(&parsed.program)
}
```

**注意点:**

- rsvelte は既に Phase 2 (analyze) で export やスコープ解析を行っている
- この既存解析結果を最大限再利用し、svelte2tsx 固有の追加解析のみ実装する
- 特に `ExportedNames`, `Stores`, `ImplicitTopLevelNames` は Phase 2 の `Scope` / `Binding` 情報から導出可能

### 3.3 Phase B: NAPI バインディング

既存の NAPI バインディング（`src/napi.rs`）を拡張し、`svelte2tsx()` を公開する。

```rust
#[napi]
pub fn svelte2tsx(
    source: String,
    options: Option<Svelte2TsxOptions>,
) -> napi::Result<Svelte2TsxResult> {
    // ...
}

#[napi(object)]
pub struct Svelte2TsxResult {
    pub code: String,
    pub map: String,  // JSON encoded source map
    pub exported_names: Vec<ExportedName>,
}
```

**統合方法:**

既存の language-tools で svelte2tsx を呼び出している箇所を rsvelte NAPI に差し替え：

```typescript
// Before (language-server/src/plugins/typescript/DocumentSnapshot.ts)
import { svelte2tsx } from 'svelte2tsx';
const result = svelte2tsx(content, options);

// After
import { svelte2tsx } from 'rsvelte';
const result = svelte2tsx(content, options);
```

### 3.4 Phase C: svelte-check の最適化

#### C-1. Incremental モードの改善

現行の Incremental モードのボトルネック：

1. ファイルごとに svelte2tsx を逐次実行
2. ディスク I/O（`.tsx` / `.d.svelte.ts` の書き出し）

Rust 化による改善：

- **並列変換**: rayon で全 `.svelte` ファイルを並列に svelte2tsx 変換
- **メモリ内キャッシュ**: ファイルシステムを介さずメモリ上で変換結果を保持
- **差分検出**: ファイルハッシュベースの効率的なキャッシュ無効化

```rust
use rayon::prelude::*;

pub fn batch_svelte2tsx(files: &[SvelteFile]) -> Vec<Svelte2TsxResult> {
    files.par_iter()
        .map(|file| svelte2tsx(&file.content, &file.options))
        .collect()
}
```

#### C-2. Svelte 診断のネイティブ化

rsvelte コンパイラは既に Validator（A11y 警告、未使用 export 等）を実装済み。
これを svelte-check の SveltePlugin の代替として使用できる：

```rust
#[napi]
pub fn get_svelte_diagnostics(source: String, filename: String) -> Vec<Diagnostic> {
    let result = compile(&source, &options);
    result.warnings.into_iter()
        .map(|w| Diagnostic {
            range: w.range,
            message: w.message,
            severity: w.severity,
            code: w.code,
        })
        .collect()
}
```

#### C-3. 全体フロー（最適化後）

```
svelte-check (CLI)
    ↓
[Rust/NAPI] batch_svelte2tsx() — 全 .svelte を並列変換
    ↓
[Rust/NAPI] get_svelte_diagnostics() — Svelte 固有の診断
    ↓
[TypeScript] tsc/tsgo — 型チェック（変換済み .tsx に対して）
    ↓
[Rust/NAPI] map_diagnostics() — ソースマップ逆引き
    ↓
出力
```

### 3.5 Phase D: Language Server 統合（将来）

Language Server は TypeScript / LSP プロトコルとの密な統合が必要なため、
完全な Rust 化は段階的に行う：

1. **Document Snapshot の高速化** — svelte2tsx の NAPI 化（Phase B で完了）
2. **CSS 診断のネイティブ化** — rsvelte の CSS 解析を活用
3. **位置マッピングの高速化** — ソースマップ逆引きを Rust で実装
4. **将来的**: LSP サーバー自体の Rust 化（tower-lsp 等）

---

## 4. 出力互換性の検証

### 4.1 テスト戦略

svelte2tsx には 300+ のテストサンプルが存在する（`test/htmlx2jsx/samples/`, `test/svelte2tsx/samples/`）。
各サンプルは入力 `.svelte` と期待される出力 `.ts` のペアで構成されている。

```
test/svelte2tsx/samples/sample-name/
├── input.svelte          # 入力
├── expectedv2.ts         # Svelte 4 期待出力
└── expected-svelte5.ts   # Svelte 5 期待出力（あれば）
```

**テスト方針:**

1. Rust 実装の出力を JS 版の期待出力と比較
2. ソースマップの位置精度を検証
3. 既存の svelte-check テストスイート（`test-success/`, `test-error/`）で E2E 検証

### 4.2 出力フォーマットの完全互換

svelte2tsx の出力は language-server と typescript-plugin の両方が消費するため、
以下のインターフェースを完全に互換にする必要がある：

```typescript
interface SvelteCompiledToTsx {
	code: string; // 生成された TSX コード
	map: SourceMap; // v3 ソースマップ
	exportedNames: IExportedNames; // export 情報
	events: ComponentEvents; // イベント情報（deprecated）
}
```

---

## 5. 依存関係と技術選定

### 5.1 Rust 側の依存関係

| 用途          | 現行 (JS)                 | Rust 代替                     |
| ------------- | ------------------------- | ----------------------------- |
| Svelte パース | `svelte/compiler`         | rsvelte（既存）               |
| TS パース     | `typescript` compiler API | OXC parser（既存）            |
| ソースマップ  | `magic-string`            | 独自実装 or `sourcemap` crate |
| AST 走査      | `estree-walker`           | 独自 visitor（既存パターン）  |
| スコープ解析  | `periscopic`              | rsvelte Phase 2（既存）       |
| NAPI          | —                         | `napi-rs`（既存）             |

### 5.2 既存 rsvelte 資産の再利用

| rsvelte モジュール         | svelte2tsx での活用                              |
| -------------------------- | ------------------------------------------------ |
| Phase 1 (parse)            | Svelte AST 生成                                  |
| Phase 2 (analyze)          | スコープ解析、export 追跡、ストア検出、rune 検出 |
| Phase 3 (transform) の一部 | コード生成パターンの参考                         |
| Validator                  | Svelte 診断（svelte-check 用）                   |
| CSS 解析                   | CSS 診断（svelte-check 用）                      |

---

## 6. 型定義（shim）ファイルの扱い

svelte2tsx が生成するコードは、以下の shim 型定義に依存している：

- `svelte-shims-v4.d.ts` — ヘルパー型（`__sveltets_2_partial` 等）
- `svelte-jsx-v4.d.ts` — DOM 要素の型マッピング（`svelteHTML` namespace）

**方針:**

- これらの `.d.ts` ファイルはそのまま維持する（TypeScript が消費するため）
- Rust 側の TSX 生成コードがこれらの型と整合するようにする
- 将来的に不要なヘルパー型を減らす最適化の余地はある

---

## 7. 実装優先度とロードマップ

### Phase A: svelte2tsx コア（推定工数: 大）

| 優先度 | タスク                              | 根拠                                      |
| ------ | ----------------------------------- | ----------------------------------------- |
| 1      | MagicString 相当の実装              | 全変換の基盤                              |
| 2      | テンプレート → TSX 変換（基本要素） | Element, MustacheTag, Text                |
| 3      | 制御構文の変換                      | IfBlock, EachBlock, AwaitBlock            |
| 4      | コンポーネント関連                  | InlineComponent, Slot, SnippetBlock       |
| 5      | ディレクティブ変換                  | Binding, EventHandler, Action, Transition |
| 6      | スクリプト解析（OXC ベース）        | ExportedNames, Stores, Generics           |
| 7      | render 関数 + component export 生成 | 最終出力フォーマット                      |
| 8      | ソースマップ生成                    | 位置マッピング                            |
| 9      | テスト互換性検証                    | 300+ テストケースのパス                   |

### Phase B: NAPI 統合（推定工数: 小）

| 優先度 | タスク                             |
| ------ | ---------------------------------- |
| 1      | `svelte2tsx()` NAPI 関数の公開     |
| 2      | language-server での差し替え検証   |
| 3      | typescript-plugin での差し替え検証 |

### Phase C: svelte-check 最適化（推定工数: 中）

| 優先度 | タスク                     |
| ------ | -------------------------- |
| 1      | バッチ並列変換の実装       |
| 2      | Svelte 診断のネイティブ化  |
| 3      | Incremental モードの最適化 |
| 4      | ソースマップ逆引きの高速化 |

---

## 8. リスクと課題

### 8.1 出力互換性

- svelte2tsx の出力は TypeScript の型推論に直結するため、微妙な差異でも型エラーが変わる可能性がある
- 空白・改行の違いでソースマップの位置がずれる可能性がある
- **対策**: テストケースの文字単位比較 + ソースマップ位置検証

### 8.2 TypeScript compiler API の代替

- 現行の svelte2tsx は `<script>` 内の解析に TypeScript compiler API を直接使用
- OXC はTypeScript の型チェック機能は持たない（パースのみ）
- **対策**: svelte2tsx に必要なのはパース + AST 走査のみ。型チェックは tsc/tsgo に委譲するため、OXC で十分

### 8.3 Svelte バージョン互換性

- svelte2tsx は Svelte 3 / 4 / 5 の全バージョンに対応
- rsvelte は Svelte 5 のみ対応
- **方針**: Svelte 5 のみサポート（Svelte 4 以前は公式 svelte2tsx を引き続き使用）

### 8.4 SvelteKit 統合

- svelte2tsx には SvelteKit 固有の処理がある（`+page.ts`, `+server.ts` 等のルートファイル処理）
- `internalHelpers.upsertKitFile()` は `.ts/.js` ファイルに型注釈を注入する
- **方針**: 初期実装では SvelteKit 固有機能を後回しにし、基本的な `.svelte` 変換を優先

### 8.5 emitDts

- `emitDts()` は TypeScript compiler API（`ts.createProgram` → `program.emit`）を使用
- これは Rust 化が困難（TypeScript の型推論が必要）
- **方針**: `emitDts` は TypeScript 側に残す

---

## 9. 成功指標

| 指標                      | 目標                                                       |
| ------------------------- | ---------------------------------------------------------- |
| svelte2tsx テスト互換性   | 300+ テストケースの 100% パス                              |
| svelte-check E2E テスト   | 既存テストスイートの 100% パス                             |
| 変換速度（単一ファイル）  | JS 版の 10x 以上                                           |
| svelte-check 全体実行時間 | JS 版の 3-5x 高速化（型チェックは tsc 依存のため上限あり） |
| ソースマップ精度          | 全位置マッピングが JS 版と一致                             |
