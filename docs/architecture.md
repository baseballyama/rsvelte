# アーキテクチャ — カーネル、言語プラグイン、計測

- 日付: 2026-10-01（`201b86fd6b` 時点）
- 対象: Svelte と Vue のコンポーネントに対する compile / format / lint / type check の一式と、Vue の構文を Svelte の意味でコンパイルする svue。
- 数値の出どころは節ごとに書く。性能の現在値は `tools/performance/baseline.json`、正しさの現在値は `fixtures/_registry/parity.json` が正本で、この文書の数はその写しである。変更前後の数は、その変更のコミットのメッセージから引用し、短い SHA を添える。

## 1. 層

```
rsvelte_command_line ──► rsvelte_svue ──► rsvelte_svelte ─┐
   │            └──────► rsvelte_vue ────┼──► rsvelte_javascript, rsvelte_stylesheet, rsvelte_markup ──► rsvelte_kernel
   └──────────────────────────────────┘
(ホスト)    (言語プラグイン)              (埋め込み言語と共有の判断)        (言語を知らない)
```

依存は右向きだけ。カーネルには Svelte も Vue も JavaScript も CSS も出てこない（`crates/rsvelte_kernel/src/lib.rs` の冒頭がその約束）。

### カーネルが持つもの（言語に依存しない契約）

| 契約 | 役割 | 実装 |
|---|---|---|
| `Document` / `Registry::document` | Store the path and text. Check the shared size limit once in `Document::new`; do not select a language | `computation/pipeline.rs` |
| `Artifact` / `DocumentContext` | 文書ごとに一度だけ計算される派生物（パース、名前解決、HIR、解析）。タスクはパーサを直接呼ばず成果物を要求する | `computation/database.rs` |
| `Facet` | A question plugins can answer. Each provider registers an ID, a document predicate and a computation. `context.facet::<F>()` caches the matching provider's answer. No match returns `None`; overlapping providers for the same facet are a registration conflict and panic when queried | `computation/database.rs` |
| `Task` | 文書 1 つで完結する処理（compile、format、lint） | `computation/pipeline.rs` |
| `ProjectTask` | 他の文書に依存する処理（型検査）。文書ごとの `prepare` は並列パスで同じ `DocumentContext` を使って走り、`finish` は最後に一度 | `computation/pipeline.rs` |
| `run_each` / `run` | `run_each` は結果が確定した文書から順に sink に渡す。`run` は rayon の `collect` で文書の順に集める（ロックを使わない） | `computation/pipeline.rs` |
| `idx` | 型付き ID（`newtype_index!`。中身は `NonZeroU32` なので `Option<Identifier>` も 4 バイト）と、ID で引く side table `IndexVector` | `source/index.rs` |
| `token` | 表層のトークン表 `Tokens<K>`。空白とコメントを含めて並べるとソースに一致することを、言語を知らずに確かめる | `source/tokens.rs` |
| `lint::Rule<C>` | ルールの契約。コンテキスト型 `C` は言語が決める。カーネルはルールごとに計時し、位置順に並べ、ESLint の形で出力する | `diagnostics/rules.rs` |
| `doc` | prettier の `printDocToString` の移植（整形の出力エンジン）。文字幅は prettier の `getStringWidth` から生成した表 | `output/document.rs`, `output/width.rs` |
| `emit::Emitter` | 出力と対応表。逆引きは `lookup`（文字単位のソースマップと同じ最大下界）と `lookup_overlap`（Volar の規則: 範囲内のコピー部分だけを写す） | `output/emitter.rs` |
| `Diagnostic` / `Unsupported` | 診断と「未対応なので出力しない」。ESLint の一点だけの報告のために、終端を持たない診断（`has_end = false`）も表せる | `diagnostics/diagnostic.rs` |
| `metrics` / `pool` | フェーズ計測と割り当て計数、バッファ再利用（§5.2） | `performance/measurement.rs`, `performance/buffer_pool.rs` |
| `hash` | SHA-256。移植した道具がダイジェストから出力を作る場合のため（`@vitejs/plugin-vue` のスコープ ID） | `source/hashing.rs` |

### 埋め込み言語と共有の判断

Svelte と Vue の両方が使う。

- `rsvelte_javascript`: AST（型注釈はサイドテーブル）、スコープ解析（ホストの言語が開くスコープを受け取る）、コード生成、JS 整形、ESLint `no-unused-vars`（判定する束縛の集合はホストが渡す）、型検査 `check.rs`（ファセット `TypeScriptView` と、それに対して書いた一つの `Check` プロジェクトタスク、TypeScript 7 のネイティブ `tsc` バックエンド）
- `rsvelte_stylesheet`: CSS のパース、スコープ付け、整形
- `rsvelte_markup`: 文字参照の展開と、`svelte/button-has-type` と `vue/html-button-has-type` が共有する判断 `button_type`

### Svelte プラグインが持つもの

- 成果物: `Parsed`（表層の木）、`Resolved`（名前解決）、`Normalized`（HIR）、`Analyzed`（コンパイラの解析）、`ScopedStylesheet`
- ファセット `TypeScriptView` の答え: svelte2tsx と同じ形の射影と、`Emitter::lookup_span` による逆引き
- タスク: `svelte.compile/{client,server}`、`svelte.format/default`、`svelte.lint/default`、プロジェクトタスク `svelte.check/default`（`rsvelte_javascript::check::Check` の値）
- コンパイラ（analyze、lower の client と server）は表層の木ではなく `CompileInput`（JS の木、インスタンススクリプト、HIR、スタイルシート、テンプレートの式）だけを読む。HIR を作れる別のフロントエンドは、同じコンパイラでコンパイルできる。この移行の前後で、Svelte コーパスの compile / format / lint の出力 70,608 ファイルがバイト一致した（`db94f0bd13`）
- HIR は公開の `CompilerSyntaxTreeBuilder` で組み立てる。属性名はソースの範囲（`Name::Source`）か、フロントエンドが綴った名前（`Name::Spelled`、例: Vue の `@click` は `onclick`）
- lint: early（表層の木）のルール `no-unused-vars` と、late（HIR）のルール `svelte/button-has-type`

### Vue プラグインが持つもの

カーネルの柔軟性を試すための 2 つ目の言語。

- 成果物: `Parsed`、`Resolved`（スクリプトとテンプレートを合わせた 1 回のスコープ解析と、compileScript の binding type）
- ファセット `TypeScriptView` の答え: @vue/language-core の仮想コードと同じ形の射影と、`Emitter::lookup_overlap` による逆引き
- タスク: `vue.compile/default`（compiler-core と compileScript の移植）、`vue.format/default`（prettier の HTML プリンタの移植）、`vue.lint/default`（`no-unused-vars`、`vue/no-unused-vars`、`vue/multi-word-component-names`、`vue/html-button-has-type`）、プロジェクトタスク `vue.check/default`
- JS の解析・整形・`no-unused-vars`・`tsc` バックエンドと CSS は、Svelte と同じ `rsvelte_javascript` / `rsvelte_stylesheet` を使う

2 つ目の言語のためにカーネルと `rsvelte_javascript` に足したもの（`573ac584b6`、`a15cdcda04`）: ホストが開くスコープ（Vue の `v-for`）、ホストが渡す `no-unused-vars` の判定対象、終端を持たない診断、SHA-256、ファセット。どれも Vue に固有ではない。

### svue

`.svue` は Vue のテンプレート構文で書き、Svelte の意味でコンパイルする。`rsvelte_svue` が持つのは Vue の木から Svelte の HIR を作る変換（`frontend.rs`）だけで、パースは Vue プラグインの `rsvelte_vue::Parsed`、名前解決・解析・出力は Svelte プラグインの関数を使う。Svelte の意味を持たない構文（`v-for`、`:x` / `@x` 以外の指令など）は `compile_unsupported` で拒否する。オラクルは Rust と独立に書いた `tools/fixtures/src/svue.ts` で、`.svue` を Svelte の構文に書き直して公式の Svelte コンパイラに通す。

### 分離の判断基準

**「別の言語を追加するとき、それを書き直すか」**で置き場所を決めた。

- 書き直さないもの（スケジューラ、成果物とファセットのキャッシュ、ルールの走らせ方、対応表の逆引き、doc プリンタ）はカーネルに置く。
- JavaScript の意味に属するもの（未使用変数、`tsc` の起動と出力解析と写し戻し）は `rsvelte_javascript` に置く。
- 二つのマークアップ言語が同じ判断をするもの（文字参照、ボタンの `type`）は `rsvelte_markup` に置く。木の違いから来る部分（どの属性を `type` と見るか、指摘をどこに付けるか）だけを各プラグインに残す。

## 2. パイプライン

`Registry::document` creates a document from its path and text without consulting plugins.
Unknown extensions and extensionless paths are valid. The kernel has no language registry or
language ID on a document. Each `Task::applies`, `ProjectTask::applies` and facet provider decides
which documents it handles, using the path or content. Several tasks can handle the same
document. Task IDs are names only; the kernel does not interpret their prefixes. A document
with no matching task has an empty result. The fixture loader keeps such documents too.

1. **文書パス**（rayon、文書単位で並列）: 文書ごとに `DocumentContext` を 1 つ作り、選ばれたタスクを連続して走らせる。成果物とファセットは最初に要求したタスクが計算し、以降は使い回す。`ProjectTask` の `prepare` もここで走る。
2. **プロジェクトパス**: `ProjectTask::finish` を全 part に対して一度。型検査はここで `tsc` を 1 プロセスだけ起動する。
3. **sink**: 文書の結果は確定した時点で sink に渡り、sink が戻ったら解放される。プロジェクトパスを待つ文書だけが保持される。

In the current per-file pipeline, document tasks run before project tasks' `prepare`.
When compile and type check are both selected, JavaScript/CSS is already generated when
`prepare` runs. Type checking uses a separate TypeScript projection of the source AST, not the
compiled JavaScript. Compile does not consume the project type-check result.

`Document` holds the path and source text. `DocumentContext` caches the requested AST (`Parsed`), name
resolution (`Resolved`), template HIR (`Normalized`) and compiler analysis (`Analyzed`).
Resolution and analysis store facts in tables keyed by node or binding IDs; they do not mutate
the source AST. Compile builds a separate output JS AST and prints it into `TaskOutput`.
The document's `DocumentContext` and its trees and tables are dropped when `run_document` returns.
For type checking, `Part` owns the TypeScript text, mappings, type environment and a source
copy; `finish` uses those values after every document's pass. Pending `TaskOutput`s are kept
until `finish` adds their diagnostics, then passed to the sink. A document that returned no
`Part` goes to the sink immediately after its document pass.

型検査のデータの流れは次のとおり:

```
context.facet::<TypeScriptView>()（matching provider's answer, document pass）
  ─► Check::prepare: 射影・逆引き・宣言ファイルの環境を part に
  ─► Check::finish: 環境を合わせ、Tsc::check（rsvelte_javascript、プロジェクトパス、1 プロセス）
  ─► 文書ごとの MapBack（Svelte: lookup_span、Vue: lookup_overlap）
  ─► svelte-check / vue-tsc の形の JSON
```

同じ `Check` が三つのタスクになる。`svelte.check/default`（Svelte の文書）、`vue.check/default`（Vue の文書）、CLI が登録する `ts.check/default`（両方を 1 回の tsc で）。導入時の計測では、30 ユニットで tsc の呼び出しが 2 → 1、壁時計が ~100 → ~67 ms になった（`a15cdcda04`）。

## 3. 正直さの規約

近似した出力は、一致率に「偶然合ったもの」を混ぜる。そこで次の規約を置いた。

| 規約 | 具体例 |
|---|---|
| 移植していない構文は `Unsupported` を返す。そのタスクはファイルを書かず、診断を残す | 整形は、移植していないレイアウトを `flat_only` で包み、1 行に収まらなければ拒否する。コンパイラはコンポーネント、`<slot>`、`svelte:` 要素を拒否する。以前は DOM 要素としてコンパイルしており、拒否に変えたことでパースできない JS が client で 92 → 5 件になった（`c7737d004a`）。TypeScript の `enum` と値を持つ `namespace` は、捨てずに上流の `typescript_invalid_feature` で拒否する（`ca6b265616`）。svue は Svelte の意味を持たない構文を拒否する |
| 外部ツールの出力は境界で厳密に読む | `tsc` の pretty 出力は、知っている形だけを受理する。件数を `tsc` 自身の `Found N errors` と突き合わせ、知らない行は黙って捨てずにエラーにする |
| 値を運ぶものがない欄は `UNMEASURED` と書き、0 と書かない | `metrics` 機能なしのビルドでは、割り当て欄が `UNMEASURED` になる |
| 計測は自分がどのアームかを名乗る | `rsvelte` は、ビルド元の `git rev-parse HEAD`（差分があれば `-dirty`）を埋め込み、レポートに書く |
| 大きさは判断である | よく使う記録（`Span`、`Mapping`、`Token`、doc のノード、HIR、両方のテンプレート AST など）は `const _: () = assert!(size_of::<T>() == N)` で大きさを固定する。欄を足して広がると、性能のラチェットより先にビルドが止まる（`36c3539efb`） |

## 4. 正しさ（オラクルとの一致）

`rsvelte fixtures` が `actual/` を書き、`tools/fixtures` の `compare` がオラクルの `expected/` と比べる。`fixtures check` は全タスク・全 variant・全ユニットの判定を `fixtures/_registry/parity.json` と比べる二方向のラチェットで、CI が毎回走らせる（§6、詳細は [fixtures.md](fixtures.md) §10）。以下の数は `201b86fd6b` の `parity.json`（3,068 エントリ）を数えたもの。

### 手書きユニット

| タスク | オラクル | ユニット | 結果 |
|---|---|---|---|
| `svelte.compile/client` / `server` | svelte 5.57.1 | `fixtures/svelte/rsvelte`（13） | 13/13 |
| `svelte.format/default` | prettier 3.9.9 + prettier-plugin-svelte 4.1.1 | 同上 | 13/13 |
| `svelte.lint/default` | eslint 10.11.0 + eslint-plugin-svelte 3.23.0（中核の非推奨でない全ルール + `configs.all`） | 同上 | 13/13（rsvelte が実装したルールの指摘を比較） |
| `svelte.check/default` | svelte-check 4.7.6 + typescript 6.0.3（rsvelte 側は tsc 7.0.2） | 同上 | 13/13 |
| `vue.compile/default` | @vue/compiler-sfc（@vitejs/plugin-vue の本番出力） | `fixtures/vue/rsvelte`（19） | 17/17。2 件は移植が拒否するので `fixture.toml` で skip（`check/template-shapes`: 束縛した `class`、`lint/button-types`: `type` と `:type` の重複） |
| `vue.format/default` | prettier 3.9.9 | 同上 | 19/19 |
| `vue.lint/default` | eslint + eslint-plugin-vue（全ルール） | 同上 | 19/19 |
| `vue.check/default` | vue-tsc 3.3.11 + typescript 6.0.3（rsvelte 側は tsc 7.0.2） | 同上 | 19/19。うち 2 件の指摘は TS 6 と 7 の版差なので、ガード付きの調整で記録した（§7 の 4） |
| `ts.check/default` | ユニットごとに svelte-check か vue-tsc | 両方（32） | 32/32（同じ 2 件の調整） |
| `svue.compile/client` / `server` | `.svue` を Svelte の構文に書き直して svelte 5.57.1 | `fixtures/svue/rsvelte`（5） | 5/5 |

Vue の射影は @vue/language-core の仮想コードと同じ形にしてある（`__VLS_ctx`、`__VLS_SetupExposed`、`__VLS_asFunctionalElement1`、`__VLS_vFor`）。型検査のメッセージには `'__VLS_ctx.maybe' is possibly 'undefined'` のように射影の名前と型がそのまま出るので、射影の形が違えば文字列は一致しない。

### 型検査の位置の一致

位置が合うのは、対応表の逆引きを上流と同じ規則にしたからである。svelte-check は診断の終端を「生成側の終端位置にある文字の元位置」に写す（文字単位のソースマップの最大下界、`lookup_span`）。Volar は範囲の内側のコピーされた文字だけを写す（`lookup_overlap`）。

svelte2tsx は、値のある属性では `=` をその場で `:` に書き換えるので、キーの終端は `=` に写る。値のない属性では `:` を挿入するので、キーの最後の文字に写る（`<button type>` のエラーは 1 文字短い）。射影は同じ位置に写像点を置くことでこれを再現している（`project.rs` の `mark`）。

### コーパスでのコンパイル

`parity.json` は、rsvelte が未対応として拒否したユニットを載せない（`893f2cf1c7` の時点で 16,071 件）。載っているもののうち、Svelte コーパスの compile は次のとおり。

| 判定 | client | server |
|---|---|---|
| match | 1,031 | 1,029 |
| mismatch | 277 | 289 |
| unparseable（JS としてパースできない出力。拒否すべきところで出力している欠陥） | 5 | 0 |
| unexpected | 4 | 4 |
| missing | 100 | 98 |

`svelte.compileModule`（`.svelte.js`、38 ユニット）は対応するタスクが未実装なので、両ターゲットとも 38 件すべてが missing。

## 5. 性能とメモリ

### 5.1 性能のラチェット（`tools/performance`）

時間はマシンで揺れるので、揺れない量だけを基準値と比べる。

| 量 | 数え方 | 比べ方 |
|---|---|---|
| 割り当て回数・バイト数（全体とフェーズごと）、生存ヒープのピーク増分 | `metrics` 付きの `rsvelte performance` が、全文書タスクを 1 スレッドで `rounds` 回走らせ、最後の（プールが温まった）ラウンドを `CountingAllocator` で数える | 完全一致 |
| 命令数（1 ラウンド） | metrics なしの出荷用ビルドを cachegrind の下で `rounds=2` と `rounds=1` で走らせた差 | ±0.2% |
| 命令数（読み込み） | `rounds=0`（起動、走査、読み込み、文書の構築） | ±0.2% |

決定的である理由:

- 1 スレッドなので、割り当ての列は入力とバイナリの関数になる（同じコーパスでの 2 回の実行がバイト一致、`fa4072dfa3`）。
- `run` がロックを使わないので、macOS と Linux の割り当てが一致する。以前は macOS の mutex が最初のロックで割り当て、文書数（17,512）だけ差が出ていた（`a5f67528cd`）。
- 読み込みはディレクトリを名前順・深さ優先でたどるので、ファイルシステムの列挙順に依存しない（`a5822ee26f`）。
- 命令数は、同じツリーの 2 回の差が 1e-7 程度（`a5f67528cd`）。

ラチェットは二方向で、上がった計数も、基準値を書き換えずに下がった計数も失敗にする。改善はそれを入れた変更が基準値に書き込む。割り当ては `mise run performance:update`、命令数は `tools/performance/linux.sh --update`（CI と同じ環境の Docker コンテナで、ステージしたソースとフィクスチャを測る）で記録する。

現在値（`201b86fd6b`、命令数は arm64 Linux）:

| 量 | 値 |
|---|---|
| 母集団 | 17,513 文書、32,265,485 バイト、9 タスク（svelte の compile ×2・format・lint、vue の compile・format・lint、svue の compile ×2） |
| 割り当て | 2,021,660 回、137,051,019 バイト |
| 生存ヒープのピーク増分 | 35,887,845 バイト |
| 命令数（1 ラウンド） | 2,755,664,795 |
| 命令数（読み込み） | 292,546,143 |

推移（各コミットの `baseline.json` から）: 命令数は最初に記録した `a5f67528cd` の 4,591,269,850 から −40.0%。割り当ては最初の基準値 `fa4072dfa3` の 3,425,954 回から −41.0%、バイトは 533,981,847 から −74.3%。主な変更は次のとおり（数はコミットのメッセージから）。

| コミット | 変更 | 効果 |
|---|---|---|
| `708a4403d5` | doc: 破断を作る時点で計算、アリーナのバッファをプールに | 命令数 −4.07%、`svelte.format` の割り当て 1,070,011 → 691,547 |
| `49aeb2de94` | js: 句読点をバイトで分岐して字句解析 | 命令数 −29.4%（4,417,740,418 → 3,120,504,649） |
| `a5822ee26f` | cli: パスを解析せずに読み込む | 読み込み 878,552,187 → 345,682,955（−60.7%） |
| `92571ee562` | トークン表をプールに | バイト 385,305,807 → 210,562,915（−45%） |
| `d5060ddc01` | js: パーサのリストを一本のスタックに | 割り当て −8.1% |
| `20f5846343` | プールを持ち主ごとの鍵に、Interner も再利用 | 割り当て −6.7% |
| `ff65a1e66b` | js: 埋め込み言語にトークンをイテレータで渡す | バイト −19% |
| `7908907666` | svelte: テンプレートのリストを集めずに読む | 割り当て −7.6% |
| `42b6e550e1` | 整形器が文書の行索引を使う | 命令数 −1.5% |
| `e0ef873545` | svelte の整形器がコンポーネントの中身を複製しない | 割り当て −7.8% |
| `a6eed170c4` | JSON の文字列を連続部分ごとにエスケープ | 命令数 −0.6% |
| `b58a0a72be` / `36c3539efb` / `e8eef831d3` | 幅の表、ニッチ ID、プールの予算 | 命令数 +0.22% / +0.08% / +0.22%（正しさと長く動くプロセスのための費用） |

最後の `201b86fd6b` の読み込み 345,677,577 → 292,546,143 は最適化ではない。`linux.sh` が作業ツリーのフィクスチャを使っていて、手元の実行が残した `actual/` まで読み込みの走査が数えていた。それをステージしたフィクスチャに直した訂正である。

割り当ての多いフェーズ（現在値）: `svelte.format/default` 520,270、`svelte.lower.client` 377,386、`svelte.lower.server` 230,738、`svelte.parse` 228,318、`svelte.analyze` 159,496、`svelte.resolve` 150,426。

### 5.2 バッファの再利用（`pool`）

文書ごとに作っては捨てる構造（`rsvelte_javascript::SyntaxTree`、`Tokens<K>`、`rsvelte_svelte::syntax::syntax_tree::Component`、`LayoutInstructions`、`Interner`）は、列のバッファをスレッドローカルのプールから借り、`Drop` で返す。

- **鍵**: 要素の型（`take` / `give`）か、要素の型と持ち主の型の組（`take_keyed::<K, T>` / `give_keyed`。`String` は `take_string` / `give_string`）。要素の型だけを鍵にしていたころは、同じ要素型の列を持つ別々の構造がバッファを取り合い、互いの大きさまで伸ばし合っていた（`20f5846343`）。
- **順序**: 棚は後入れ先出し。一人の持ち主が同じ型の列を複数持つときは借りた順の逆に返すので、次の文書でもそれぞれが自分の大きさのバッファを受け取る。
- **上限**: 一つの棚に `MAX_PER_KEY`（16）個、スレッド全体で `MAX_BYTES`（64 MiB）。超えるバッファは解放する。予算は言語サーバーのように長く動くプロセスのためのもので、コーパスでは一度も効かない。予算を 64 KiB に縮めた対照では割り当てが 2,021,660 → 2,547,339 回に増え、予算が経路上にあることを確かめた。帳簿付けの費用は命令数 +0.22%（`e8eef831d3`）。
- `set_enabled(false)` は効果を測るためだけにある。

### 5.3 壁時計のベンチマーク（`rsvelte benchmark`）

`rsvelte benchmark <dir> [rounds=N] [json=<file>]` の各アームは、同じ文書・同じタスクを、1 つの仕組みだけ変えて走らせる。計時ラウンドはアームを ABBA の順に交互に並べ、中央値を出す。割り当ての総数と生存ヒープのピーク増分は、アームごとに別ラウンドで取る（プロセス全体を数えるアトミックが計時を歪めるため）。

次の表はビルド `d6f426e250`（release、10 スレッド、`fixtures/svelte` の 17,489 文書、走ったのは Svelte の 4 タスク、5 ラウンド）で、クリーンな worktree から測ったもの。壁時計はマシンの混み具合で揺れるので CI では監視せず、この表は測り直すまで更新されない。仕組みどうしの比（共有・並列化・ストリーミング）を読むための表であり、変更の効果は §5.1 の計数で読む。

| アーム | 中央値 ms（plain、2 回） | 中央値 ms（metrics、2 回） | 割り当て回数 | 生存ヒープのピーク増分 |
|---|---|---|---|---|
| `shared` | 35.8 / 35.4 | 39.4 / 47.9 | 2,011,718 | 36.1 MB |
| `isolated` | 70.0 / 76.2 | 75.1 / 74.8 | 3,428,733 | 36.5 MB |
| `nopool` | 46.4 / 52.7 | 56.8 / 49.7 | 3,006,827 | 35.8 MB |
| `serial` | 232.9 / 233.6 | 251.4 / 253.8 | 2,011,703 | 35.8 MB |
| `streaming` | 35.0 / 33.8 | 36.0 / 40.9 | 2,011,702 | 0.4 MB |

- **成果物の共有**: 約 2 倍速い（70–76 → 35–36 ms）。割り当ては 41% 減る。
- **並列化**: 10 スレッドで 6.5 倍（233 → 36 ms）。
- **pool**: 23–33% 速く、割り当ては 33% 減る。
- **ストリーミング（`run_each`）**: 生存ヒープのピーク増分を 36.1 MB から 0.4 MB にする。時間の差は同じアームの 2 回の差と同程度。支配項は処理中の作業ではなく、全結果の保持だった。
- **揺れ**: plain の `isolated` と `nopool`、metrics の `shared` は 2 回の差が 10–20% ある。計時の結論は 2 回が揃う plain ビルドの `shared`・`serial`・`streaming` で出す。
- 前回の測定（`12c3db7a70`）からは `shared` が 58.5 → 35.8 ms、`serial` が 448.5 → 232.9 ms。その間の変更は §5.1 の推移のとおり。

### 5.4 型検査

コストは `tsc` の起動と検査で決まる（`12c3db7a70` の手書き 12 ユニットで、全体 51.7 ms のうち `ts.tsc` が 42.7 ms、射影は 0.02 ms）。そのため文書ごとではなく、1 プロセスにまとめる `ProjectTask` の形になっている。`ts.check` は、Svelte と Vue が混ざったプロジェクトもこの 1 プロセスで検査する。

## 6. CI

`.github/workflows/ci.yml` は、`main` と `experimental` への push とすべての pull request で三つのジョブを走らせる（`893f2cf1c7`）。

| ジョブ | ランナー | 内容 |
|---|---|---|
| `rust` | ubuntu-24.04 | `cargo fmt --check`、clippy（feature なしと `--all-features`）、rustdoc、テスト |
| `fixtures` | ubuntu-24.04 | release ビルドの `rsvelte` で `tools/fixtures/bin/run-all.ts`（全タスク × 全ユニット。型検査はオラクル自身の TypeScript 7 とパッケージで）、`fixtures check`（正しさのラチェット）、`fixtures adjust`（調整の妥当性）、ツール群の型検査 |
| `performance` | ubuntu-24.04-arm | valgrind を入れて `node tools/performance/bin/performance.ts --instructions --json performance-report.json`。レポートを成果物として残す |

二つのラチェットはどちらも二方向で、出力する一覧に件数の上限もない。対照:

- `svelte/button-has-type` の呼び出しごとに `Vec::with_capacity(1)` を足すと、`phase svelte/button-has-type allocs: 973 -> 6,405` で落ちる（`fa4072dfa3`）。
- ユニットの整形出力の末尾に 1 文字足すと、`MOVED match -> mismatch svelte.format/default …` で落ちる（`893f2cf1c7`）。

## 7. 次に効くもの

1. **整形の割り当てが最大**（`svelte.format/default` 520,270 回、§5.1）。次は lower の二つ（client 377,386、server 230,738）。
2. **パースできない JS 5 件**（client）。出力の事後条件として「自前のパーサで読み直せること」を置けば拒否に変わる。コストと、正しい出力を誤って拒否する件数は、コーパスで両方測ってから決める。
3. **プロジェクトパスを待つ文書が全タスクの出力を抱える**（`run_each`）。型検査を選ぶとストリーミングの効果が薄れる。直すと sink の契約（一文書一回）が変わる。
4. **型検査のオラクルと実装の TypeScript の版が違う**（6.0.3 と 7.0.2）。svelte-check も vue-tsc も TS 6 の JS API を要求する。`vue/rsvelte/check/template-shapes` で 2 件の差が実際に出た。
   - 引数の型の不一致: TS 6 は TS2345 の下に理由を入れ子にし、TS 7 は理由の TS2740 を直接出す。
   - スプレッド型の表示順: TS 6 は setup の束縛から、TS 7 は `ComponentPublicInstance` のメンバーから印字する。
   - どちらも、オラクル自身の仮想コードを tsc 7.0.2 に通すと rsvelte と同じ出力になる。したがって射影ではなく版の差である。`fixture.toml` の JSON 調整（`artifact = "json"`）で、`vue.check` と `ts.check` の期待値の該当要素をガード付きで置き換えている。
5. **TypeScript の射影はまだ表層の木から作っている**。HIR から作るように移すと、コンパイラ・lint・型検査が同じ判断を共有する。

## 8. 再現

```sh
# 性能のラチェット
mise run performance               # 割り当て（どのプラットフォームでも同じ）
tools/performance/linux.sh         # 命令数も（arm64 Linux のコンテナ）

# 正しさのラチェット
cargo build --release -p rsvelte_command_line
node tools/fixtures/bin/run-all.ts
(cd tools/fixtures && node bin/fixtures.ts check)

# 壁時計のベンチマーク
cargo build --release -p rsvelte_command_line --features metrics
./target/release/rsvelte benchmark fixtures/svelte rounds=5 json=benchmark.json
```
