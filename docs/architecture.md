# アーキテクチャ — カーネル、言語プラグイン、計測

- 日付: 2026-09-29
- 対象: 最小の Svelte コンポーネントに対する compile / format / lint / type check の一式。
- 数値はすべて、ビルド `12c3db7a70`（release、クリーンツリー、10 スレッド）が `rsv bench` で出した JSON から生成した。例外は明記する。

## 1. 層

```
rsv_cli ──────────────► rsv_svelte ──► rsv_js, rsv_css ──► rsv_kernel
(ホスト: 引数, 書き出し)   (言語プラグイン)   (埋め込み言語)       (言語を知らない)
```

依存は右向きだけ。カーネルには Svelte も JavaScript も CSS も出てこない（`crates/rsv_kernel/src/lib.rs` の冒頭がその約束）。

### カーネルが持つもの（言語に依存しない契約）

| 契約 | 役割 | 実装 |
|---|---|---|
| `Language` | どの文書を自分が扱うか | `pipeline.rs` |
| `Artifact` / `Ctx` | 文書ごとに一度だけ計算される派生物（パース、解析、射影）。タスクはパーサを直接呼ばず成果物を要求する | `db.rs` |
| `Task` | 文書 1 つで完結する処理（compile、format、lint） | `pipeline.rs` |
| `ProjectTask` | 他の文書に依存する処理（型検査）。文書ごとの `prepare` は並列パスで同じ `Ctx` を使って走り、`finish` は最後に一度 | `pipeline.rs` |
| `run_each` | 結果が確定した文書から順に sink に渡す。保持は作業集合だけ | `pipeline.rs` |
| `lint::Rule<C>` | ルールの契約。コンテキスト型 `C` は言語が決める。カーネルはルールごとに計時し、位置順に並べ、ESLint の形で出力する | `lint.rs` |
| `doc` | prettier の `printDocToString` の移植（整形の出力エンジン） | `doc.rs` |
| `emit::Emitter` | 出力と対応表。逆引き `lookup` は文字単位のソースマップと同じ規則（最大下界）で答える | `emit.rs` |
| `Diagnostic` / `Unsupported` | 診断と「未対応なので出力しない」 | `diag.rs` |
| `metrics` / `pool` | フェーズ計測、割り当て計数、バッファ再利用 | `metrics.rs`, `pool.rs` |

### 埋め込み言語の crate が持つもの

Svelte 以外のホストでも再利用できる。

- `rsv_js`: AST（型注釈はサイドテーブル）、スコープ解析、コード生成、JS 整形、ESLint `no-unused-vars`（`lint.rs`）、TypeScript 7 のネイティブ `tsc` バックエンド（`check.rs`）
- `rsv_css`: CSS のパース、スコープ付け、整形

### Svelte プラグインが持つもの

Svelte に固有な部分だけ。

- 成果物: `Parsed`、`Analyzed`、`ScopedCss`、`TsProjection`
- テンプレートとスクリプトを合わせたスコープ解析: テンプレート式はスコープ解析の追加の根なので、「この変数はどこかで使われるか」は 1 回の問いになる
- タスク: `svelte.compile/{client,server}`、`svelte.format/default`、`svelte.lint/default`、`svelte.check/default`

### 分離の判断基準

**「別の言語を追加するとき、それを書き直すか」**で置き場所を決めた。

- 書き直さないもの（スケジューラ、成果物のキャッシュ、ルールの走らせ方、対応表の逆引き、doc プリンタ）はカーネルに置く。
- JavaScript の意味に属するもの（未使用変数、`tsc` の起動と出力解析）は `rsv_js` に置く。Vue でも同じものを使う。
- Svelte は、テンプレートの参照をスコープ解析に渡す部分と、テンプレートを TS に射影する部分だけを持つ。

## 2. パイプライン

1. **文書パス**（rayon、文書単位で並列）: 文書ごとに `Ctx` を 1 つ作り、選ばれたタスクを連続して走らせる。成果物は最初に要求したタスクが計算し、以降のタスクは使い回す。`ProjectTask` の `prepare` もここで走る。
2. **プロジェクトパス**: `ProjectTask::finish` を全 part に対して一度。型検査はここで `tsc` を 1 プロセスだけ起動する。
3. **sink**: 文書の結果は確定した時点で sink に渡り、sink が戻ったら解放される。プロジェクトパスを待つ文書だけが保持される。

型検査のデータの流れは次のとおり:

```
Parsed ─► TsProjection（Svelte、文書パス）
       ─► Tsc::check（rsv_js、プロジェクトパス、1 プロセス）
       ─► Emitter::lookup_span（カーネル）
       ─► svelte-check の形の JSON
```

## 3. 正直さの規約

近似した出力は、一致率に「偶然合ったもの」を混ぜる。そこで次の規約を置いた。

| 規約 | 具体例 |
|---|---|
| 移植していない構文は `Unsupported` を返す。そのタスクはファイルを書かず、診断を残す | 整形は、単純な参照以外の TS 型を拒否する。型検査の射影は、コンポーネントと `svelte:` 要素を拒否する。インスタンススクリプトの `export` はコンパイラが拒否する（以前は関数の中に `export` をコピーして、不正な JS を出していた） |
| 外部ツールの出力は境界で厳密に読む | `tsc` の pretty 出力は、知っている形だけを受理する。件数を `tsc` 自身の `Found N errors` と突き合わせ、知らない行は黙って捨てずにエラーにする。この規約で、複数ファイル時の要約表を見落としていたことが初回実行で分かった |
| 値を運ぶものがない欄は `UNMEASURED` と書き、0 と書かない | `metrics` 機能なしのビルドでは、割り当て欄が `UNMEASURED` になる。RSS が取得できないときも同じ |
| 計測は自分がどのアームかを名乗る | `rsv` は、ビルド元の `git rev-parse HEAD`（差分があれば `-dirty`）を埋め込み、レポートに書く |

## 4. 正しさ（オラクルとの一致）

`rsv fixtures` が `actual/` を書き、`tools/fixtures` の `compare` がオラクルの `expected/` と比べる。

### 手書きユニット `fixtures/svelte/rsvelte`（12 件）

| タスク | オラクル | 結果 |
|---|---|---|
| `svelte.compile/client` / `server` | svelte 5.57.1 | 14/14 行一致（JS と CSS） |
| `svelte.format/default` | prettier 3.9.9 + prettier-plugin-svelte 4.1.1 | 11/12。`check-cases` は `{ label: string }` 型を整形できず拒否 |
| `svelte.lint/default` | eslint 10.11.0 + eslint-plugin-svelte 3.23.0 | 12/12 |
| `svelte.check/default` | svelte-check 4.7.6 + typescript 6.0.3（rsvelte 側は tsc 7.0.2） | 12/12。属性の型エラー 6 件と、`{#if}` による絞り込みを含む |

### 型検査の位置の一致

位置が合うのは、対応表の逆引きを svelte-check と同じ規則にしたからである。svelte-check は診断の終端を「生成側の終端位置にある文字の元位置」に写す（文字単位のソースマップの最大下界）。

svelte2tsx は、値のある属性では `=` をその場で `:` に書き換えるので、キーの終端は `=` に写る。値のない属性では `:` を挿入するので、キーの最後の文字に写る（`<button type>` のエラーは 1 文字短い）。

射影は同じ位置に写像点を置くことでこれを再現している（`project.rs` の `mark`）。

### コーパスでのコンパイル

`fixtures/svelte` の全体、17,487 ユニット、client。

| 量 | 件数 |
|---|---|
| rsvelte が JS を出したユニット | 4,656 |
| うちオラクルと一致 | 1,040（導出値: 17,487 − missing 12,831 − mismatch 3,524 − unparseable 92） |
| 不一致 | 3,524 |
| **パースできない JS を出した** | **92**。拒否すべきところで出力している欠陥 |

測ったのは `76c177cbdd` のコンパイラ。この後のコミットはコンパイラを変えていない。

bench の「診断なし」（4,643）は正しさではない。一致は 22% しかない。母集団の数え方と、オラクルとの一致は別の量として読む。

## 5. 性能とメモリ

`rsv bench <dir> [rounds=N] [json=<file>]` の各アームは、同じ文書・同じタスクを、1 つの仕組みだけ変えて走らせる。

- 計時ラウンドはアームを ABBA の順に交互に並べ、全ラウンドと中央値を出す。
- 割り当ての総数と生存ヒープのピーク増分は、アームごとに別ラウンドで取る（プロセス全体を数えるアトミックが計時を歪めるため）。
- フェーズ表は、もう 1 回の `shared` ラウンドから取る。

対象は `fixtures/svelte` の全体、4 タスク（compile ×2、format、lint）、5 ラウンド。`plain`（metrics なし）と `metrics` の 2 ビルドを plain → metrics → metrics → plain の順に走らせた。

| アーム | 中央値 ms（plain、2 回） | 中央値 ms（metrics、2 回） | 割り当て回数 | 割り当て/入力バイト | 生存ヒープのピーク増分 |
|---|---|---|---|---|---|
| `shared` | 58.5 / 59.0 | 63.3 / 63.1 | 4,322,759 | 0.13 | 44.8 MB |
| `isolated` | 134.1 / 132.7 | 141.5 / 144.5 | 7,404,138 | 0.23 | 44.9 MB |
| `nopool` | 63.3 / 63.4 | 67.7 / 69.8 | 4,865,012 | 0.15 | 44.7 MB |
| `serial` | 448.5 / 452.4 | 475.1 / 474.4 | 4,322,900 | 0.13 | 44.7 MB |
| `streaming` | 57.9 / 61.2 | 66.8 / 64.3 | 4,305,269 | 0.13 | 1.0 MB |

母集団は 17,488 文書、入力 32.3 MB、出力 12.5 MB。unclaimed 580（`.svelte.js/.ts`。モジュールの言語は未登録）、panic 0。

| タスク | 実行 | 診断なし | 診断あり（主に未対応の拒否） |
|---|---|---|---|
| `svelte.compile/client` | 17,488 | 4,643 | 12,845 |
| `svelte.compile/server` | 17,488 | 4,648 | 12,840 |
| `svelte.format/default` | 17,488 | 4,199 | 13,289 |
| `svelte.lint/default` | 17,488 | 5,410 | 12,078 |

### 読み取れること

- **成果物の共有**: 2.3 倍速い（134 → 59 ms）。割り当ては 42% 減る（7.40M → 4.32M）。
- **バッファの再利用（pool）**: 時間 7%、割り当て 11% を削る（4.87M → 4.32M）。
- **並列化**: 10 スレッドで 7.6 倍（449 → 59 ms）。
- **ストリーミング（`run_each`）**: 生存ヒープのピーク増分を 44.8 MB から 1.0 MB にする。時間は変わらない。
  - 事前の予測は「5 MB 未満」だった。serial でもピークが 44.7 MB で並列度に依存しないことから、支配項は「全結果の保持」だと予測していた。
  - `rsv fixtures` はすでに `run_each` で書き出している。
- **計測自体のコスト**: metrics 機能のオーバーヘッドは約 7%（shared: 58.8 → 63.2 ms）。計時の結論は plain ビルドで出す。
- **最大 RSS**: 125 MB。プロセス全体の最高値で、全アームを含む。

### フェーズ（metrics ビルド、`shared` 1 ラウンド、self = 入れ子のフェーズを除いた分）

| フェーズ | 呼び出し | self ms（スレッド時間の合計） | 割合 | self 割り当て | self バイト |
|---|---|---|---|---|---|
| `svelte.parse` | 17,488 | 291.2 | 42.8% | 806,415 | 66.1 MB |
| `svelte.format/default` | 17,488 | 113.1 | 16.6% | 1,024,096 | 164.4 MB |
| `svelte.lower.client` | 5,410 | 103.8 | 15.3% | 974,031 | 59.8 MB |
| `svelte.lower.server` | 5,410 | 64.8 | 9.5% | 783,990 | 49.7 MB |
| `js.print` | 9,291 | 31.0 | 4.6% | 218,541 | 34.1 MB |
| `svelte.lint/default` | 17,488 | 29.9 | 4.4% | 91,847 | 11.3 MB |
| `svelte.analyze` | 5,410 | 27.6 | 4.1% | 292,226 | 13.5 MB |
| `no-unused-vars` | 5,410 | 4.9 | 0.7% | 13,888 | 1.7 MB |
| `svelte/button-has-type` | 5,410 | 2.6 | 0.4% | 970 | 0.1 MB |
| `js.parents` | 5,410 | 1.9 | 0.3% | 5,410 | 0.6 MB |

`svelte.parse` は全文書に 1 回ずつ（17,488）、下流のフェーズはパースが通った 5,410 文書にだけ走る。成果物を共有すると、4 タスクがあってもパースは 1 回になる。

### 型検査

手書き 12 ユニット、ビルド `12c3db7a70` の metrics 版で、全体 51.7 ms（書き出し込み）。そのうち `ts.tsc`（ネイティブ tsc の 1 プロセス）が 42.7 ms、射影は 12 文書で 0.02 ms、レポート解析は 0.03 ms。コストは `tsc` の起動と検査で決まるので、文書ごとではなく 1 プロセスにまとめる `ProjectTask` の形になっている。

## 6. 次に効くもの（測定から）

1. **パースが CPU の 43%**。失敗する文書もパースの途中までは払う。入力 32 MB を 291 ms（スレッド合計）で処理しており、パーサ単体の最適化が最も効く。
2. **整形の割り当てバイトが最大（164 MB）**。doc 木のノードとテキストの確保が候補。フェーズ表で `svelte.format` を doc 構築と印字に分けてから手を付ける。
3. **パースできない JS 92 件**。出力の事後条件として「自前のパーサで読み直せること」を置けば拒否に変わる。コストと、正しい出力を誤って拒否する件数は、コーパスで両方測ってから決める。
4. **型検査のオラクルと実装の TypeScript の版が違う**（6.0.3 と 7.0.2）。svelte-check は TS 6 の JS API を要求する。手書きユニットでは差が出ていないが、メッセージの差は将来この版差から来うる。

## 7. 再現

```sh
cargo build --release -p rsv_cli --features metrics
./target/release/rsv bench fixtures/svelte rounds=5 json=bench.json

TSC=tools/fixtures/node_modules/.pnpm/@typescript+typescript-darwin-arm64@7.0.2/node_modules/@typescript/typescript-darwin-arm64/lib/tsc
./target/release/rsv fixtures fixtures/svelte/rsvelte --tsc $TSC --svelte tools/fixtures/node_modules/svelte
(cd tools/fixtures && node bin/fixtures.ts compare --task svelte.check --variant default --source rsvelte)
```
