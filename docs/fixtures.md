# Fixtures — 設計と運用

- 日付: 2026-10-01（§4 の取り込み結果は 2026-09-29 の測定）
- 実装: `tools/fixtures/`（TypeScript。Node 26 の型除去でそのまま実行する。`mise.toml` で Node 26.7.0 を固定。オラクルが JS のパッケージなので、ツールも JS 側で書く）
- ファイルごとの役割: [fixtures/README.md](../fixtures/README.md)
- データ: `fixtures/`
- コンセプト上の位置づけ: [concept.md](concept.md) §3-C2、§8

## 1. 要件

| # | 要件 | 出所 |
|---|---|---|
| R1 | 実プロジェクトの Svelte 5（Runes）ファイルを**ハードコピー**して、リポジトリ内で管理する（submodule に依存しない） | 依頼 |
| R2 | ライセンスが怪しいものは入れない | Q1 |
| R3 | compile の正しさは **AST 比較**で判定する。期待値は、最初の 1 回だけ公式コンパイラで生成する | Q2 |
| R4 | 無害な差分は、fixture ごとに**ピンポイントで期待側の AST を調整**して吸収する | Q2 |
| R5 | **Svelte の版上げに追従**できる | Q2 |
| R6 | 中立ファイルも入れ、runes として扱う | Q3 |
| R7 | Svelte 以外の言語（Vue、Tailwind 付き Svelte、HTML、…）を同じ仕組みで扱える | 依頼 |
| R8 | compile 以外のタスク（lint、fmt、型検査、parse …）も同じ fixture でテストできる | 依頼 |

## 2. 中心の概念

仕組みは、次の 5 つの概念の組み合わせでできている。

| 概念 | 定義 | 置き場所 |
|---|---|---|
| **source** | 取り込み元のリポジトリ。URL、固定 commit、ライセンス（SPDX と LICENSE ファイル）、除外理由 | `fixtures/_registry/sources.json` |
| **unit** | 1 つの入力ファイル。キーは `<family>/<source>/<元のパス>`。1 unit につき 1 ディレクトリで、入力・属性・期待値・実装の出力・調整を同じ場所に置く | `fixtures/<family>/<source>/<元のパス>/` |
| **language** | どのファイルを担当し、どれを受け入れるか（admission）を決める。所属する **family**（最上位ディレクトリ）と入力の拡張子も持つ | `tools/fixtures/src/languages.ts` |
| **task** | unit に対する 1 つの測定。オラクル、variant（オプションの組）、成果物（artifact）、成果物ごとの比較方法を持つ | `tools/fixtures/src/tasks/` |
| **adjustment** | 期待側の AST の 1 ノードを書き換える、ピンポイントの調整 | unit の `fixture.toml` |

`expected = snapshot(oracle, unit, task, variant) + adjustments(unit, task, variant)`

言語とタスクは直交している。Vue を足すなら language を 1 つと、それに当てるタスクを足す。lint を足すならタスクを 1 つ足す。既存の unit は、どちらの場合も触らない（R7・R8）。

## 3. ディレクトリ構成

各ファイルの役割の一覧は [fixtures/README.md](../fixtures/README.md) にある。

```
fixtures/
  _registry/                   言語をまたいで共有する台帳（sources.json、oracles.json、import-report.json、licenses/）
  <family>/<source>/<元のパス>/  unit ディレクトリ（例: svelte/bits-ui/src/lib/button.svelte/）
    input<ext>                 ハードコピーした入力
    meta.json                  生成した属性
    fixture.toml               手書きの例外（skip と adjust）。importer は触らない
    expected/<task>/<variant>.<ext>   committed のタスクの snapshot
    actual/<task>/<variant>.<ext>     実装の出力（git 管理外）
    cache/<task>/<variant>.<ext>      cached のタスクの snapshot（git 管理外）
tools/fixtures/
  package.json / pnpm-lock.yaml  オラクルの exact pin（svelte 5.57.1、acorn 8.18.0 …）と TypeScript 7
  bin/fixtures.ts              CLI
  src/*.ts                     import / regen / adjust / compare / canonical / languages / tasks
```

設計上の判断:
- **unit 単位で同じ場所に置く。** 1 つの fixture を開けば、入力・期待値・実装の出力・調整がすべて並ぶ。
- **最上位を言語ファミリーで分ける。** いまのファミリーは `svelte`、`vue`、`svue` の 3 つ。Svelte と Vue が混ざらない。Tailwind 付き Svelte は言語ではなく文脈なので、`svelte/` の下に置く（§9）。
- **タスク単位のビューは git の glob で取る。** 例: `git diff --stat -- ':(glob)fixtures/**/expected/svelte.compile/**'`。
- **予約名の退避。** 元のパスの要素が予約名（`expected` `actual` `cache` `meta.json` `fixture.toml` `input.*`）なら `~` を前置する。`~` で始まる要素にも前置するので、変換は可逆になる。これで `.gitignore` の `/fixtures/**/actual/` は unit の子にしか当たらない。実コーパスでは 543 要素が退避された（svelte 本体のテストが `input.svelte` という名前を多用しているため）。
- **`.gitignore` の規則は必ずアンカーする。** 当初の `target/` は、元のパスに `target` を含む sveltekit のテストアプリの入力 9 件と snapshot 20 件を黙って無視していた。配置を移行したときの照合で、件数が合わないことから見つかった。

## 4. 取り込み（`fixtures import`）

```
mise exec -- node tools/fixtures/bin/fixtures.ts import --from <submodule を持つチェックアウト> [--source id,...] [--accept-commit]
```

1. `sources.json` のうち `excluded` の無い source を、台帳の順に処理する。
2. チェックアウトが**実在する git の toplevel**で、`HEAD` が台帳の commit と一致することを確かめる。
   - 未初期化の submodule では、`rev-parse HEAD` が親リポジトリの commit を返してしまうので、toplevel も照合する。
   - 不一致ならエラーにする。`--accept-commit` を付けたときだけ、台帳の pin を動かす。
3. `git ls-files` のファイルだけを対象にする。ビルド成果物や `_output` の snapshot は取り込まない。
4. ファイルごとに、元のディレクトリから source の root まで遡って、最も近い LICENSE を探す。それが root の LICENSE でない場合、MIT / Apache-2.0 / ISC / Unlicense と判定できたものだけを受け入れる。
5. sha256 で重複を除く。台帳で先に来る source が優先で、部分取り込みでも全体取り込みと同じ結果になる。
6. language の admission を通す。
   - `svelte`: `compile(src, { runes: true, generate: false })` が通ること。通らないもの（legacy 構文など）は、理由のコード付きで除外する。
   - `svelte-module-js`: `compileModule` が通ること。
   - `svelte-module-ts`: 無条件で受け入れる（§11 の未決事項を参照）。
   - `vue`: `@vue/compiler-sfc` の `parse` がエラーなしで通ること。`meta.json` の `mode` に `setup`（`<script setup>`）、`options`（素の `<script>` だけ）、`template`（スクリプトなし）を記録する。
   - `svue`: `tools/fixtures/src/svue.ts` が Svelte の構文に書き直せて、Svelte コンパイラ（`runes: true`）がそれを受け入れること。
7. unit ディレクトリに `input<ext>` と `meta.json` を書き、LICENSE の写しを置く。上流で消えた unit はディレクトリごと消す。ただし `fixture.toml`（手書き）を持つ unit は消さずに残して列挙し、終了コードを 1 にする。

### 2026-09-29 時点の取り込み結果

対象は `svelte` ファミリー。`vue` と `svue` のユニットは、いまは手書きの `rsvelte` source（`fixtures/vue/rsvelte` 19 件、`fixtures/svue/rsvelte` 5 件）だけで、取り込み元のリポジトリはまだ無い。

測った対象は、主チェックアウト（`/Users/baseballyama/git/rsvelte`、`main` `5ed8ea3a3`）の submodule。admission のオラクルは svelte 5.57.1。

| 項目 | 値 |
|---|---|
| source | 104 中 77 を採用、27 を除外（理由は `sources.json` に記載） |
| 担当言語にマッチしたファイル | 23,789 |
| 採用した unit | **18,056**（`svelte` 17,476 = 推論 runes 9,488 ＋ 中立 7,988、`svelte-module-js` 38、`svelte-module-ts` 542） |
| 除外 | runes 非互換 4,837、`compileModule` が拒否 107、重複 789、入れ子 LICENSE による除外 0 |
| サイズ | 入力 35.1 MB。snapshot は 44,561 ファイル・112.9 MB（gzip で 16.7 MB） |
| 予約名の退避 | 543 要素 |
| 所要時間（1 スレッド） | import 36 s、regen 107 s |

## 5. snapshot の生成（`fixtures regen`）

```
mise exec -- node tools/fixtures/bin/fixtures.ts regen [--task id,...] [--source id,...]
```

- 各タスク × variant × 適用される unit についてオラクルを走らせ、成果物を `expected/` に書く。内容が同じなら書かない。
- オラクルが compile エラーを投げた場合は、そのエラー（`code`・`message`・位置）を `error.json` という成果物にする。エラーも期待値の一部である。
- JS の成果物は、その場で正規化器（§6）に通す。正規化できない出力があれば列挙し、終了コードを 1 にする。
  - 現時点で該当は 1 件ある。svelte 本体の `compiler-errors/samples/const-tag-snippet-invalid-reference-1` で、5.57.1 が重複宣言を含む JS を出力する。これは、その unit の `fixture.toml` の `[skip]` で `svelte.compile/client` を外し、理由を書いてある。
- `oracles.json` に、タスクごとのオラクルと正規化器の版を記録する。
- タスクの `storage` は 2 種類ある。
  - `committed`: git に入れる。
  - `cached`: `.cache/` に置き、git に入れない。
  
  どちらにするかは、サイズで決める。実測では、compile の JS テキストは入力の約 2.2 倍だが、ESTree JSON にすると約 18 倍、`parse()` の AST JSON は約 16 倍になる。JS はテキストで保存し、比較のたびに AST へ正規化する。

### 現在のタスク

| task | 対象の unit | variant | オラクル | 成果物（比較方法） |
|---|---|---|---|---|
| `svelte.compile` | `svelte` の全 unit | `client`、`server`（`runes: true`、`filename` = unit の path） | svelte | `js`（js-syntax_tree）、`css`（text）、`warnings.json`（json）、または `error.json`（json） |
| `svelte.compileModule` | `svelte-module-js` | `client`、`server` | svelte | 同上 |
| `svelte.format` | `svelte` の `rsvelte` source | `default` | prettier + prettier-plugin-svelte | `svelte`（text、バイト一致） |
| `svelte.lint` | 同上 | `default`（全ルール） | eslint + eslint-plugin-svelte + svelte-eslint-parser + @typescript-eslint/parser | `lint.json`（lint: 実装側が走らせたルールの指摘に絞って比較） |
| `svelte.check` | 同上 | `default` | svelte-check + typescript + svelte | `json`（json） |
| `vue.compile` | `vue` の全 unit | `default` | @vue/compiler-sfc（+ typescript） | `js`（js-syntax_tree）、`css`（text） |
| `vue.format` | `vue` の `rsvelte` source | `default` | prettier | `vue`（text） |
| `vue.lint` | 同上 | `default`（全ルール） | eslint + eslint-plugin-vue + vue-eslint-parser + @typescript-eslint/parser | `lint.json`（lint） |
| `vue.check` | 同上 | `default` | vue-tsc + @vue/language-core + @volar/typescript + typescript + vue | `json`（json） |
| `ts.check` | `svelte.check` と `vue.check` の unit の和 | `default` | unit ごとに svelte-check か vue-tsc | `json`（json） |
| `svue.compile` | `svue` の全 unit | `client`、`server` | `.svue` を Svelte の構文に書き直して svelte | `svelte.compile` と同じ |

storage はすべて `committed`。`ts.check` は rsvelte の言語に依存しない型検査（1 回の tsc で両方の言語）を測るためのタスクで、期待値は unit の言語のオラクルがそのまま出す。

`filename` はコンポーネント名と CSS のスコープハッシュに入る。比較する実装も、unit の path を `filename` に渡すこと。

## 6. AST 比較の定義（canonical AST）

`tools/fixtures/src/canonical.ts` が仕様である。Rust 側のハーネスも、同じテキストから同じ木を作らなければならない。

- acorn（`ecmaVersion: 'latest'`、`sourceType: 'module'`）の ESTree を土台にする。
- 位置（`start` `end` `loc` `range`）を落とす。
- `Literal.raw` を落とす。引用符の種類や数値の綴り（`0x10` と `16`）は書式として扱う。正規表現は `regex`、bigint は `bigint` を残し、JSON にできない `value` は null にする。
- コメントを落とす。**ただし** `@__PURE__` / `#__PURE__` 注釈は例外で、直後の call / `new` に `pure: true` を付ける。バンドラが消してよいかどうかが変わるため。
  - Svelte 5.57.1 の出力には、現時点で PURE 注釈が 0 件（生きたキャリアが無い）。この扱いは、合成入力の単体確認でしか検証していない。
- キーをソートする（`type` を先頭に）。
- 比較結果は「最初に異なるパス」で報告する（例: `body.5.declaration.body.body.0.declarations.0.init.arguments.0`）。

## 7. 調整（adjustment）

```toml
# fixtures/svelte/bits-ui/docs/src/lib/components/demos/portal-demo.svelte/fixture.toml
[[adjust]]
task = "svelte.compile"
variant = "client"          # 省略すると、そのタスクの全 variant に当てる
artifact = "js"             # 省略時は "js"
at = "body.5.declaration.body.body.0.declarations.0.init.arguments.0"
expect = "void 0"           # そこにオラクルが持っているもの（ガード）
replace = "undefined"       # 代わりに受け入れるもの
reason = "an absent initial value is undefined either way"
```

- `at` には、`compare` が報告した「最初に異なるパス」をそのまま書ける。
- JSON の成果物（`artifact = "json"` など、`json` で終わるもの）では、`expect` / `replace` は JSON の値で、`at` は配列の添字やキーの並びである（例: `at = "2"` で 3 件目の指摘）。
  - いま JSON の調整を持つのは `fixtures/vue/rsvelte/check/template-shapes.vue` だけで、`vue.check` と `ts.check` に 2 件ずつ。オラクルの TypeScript 6.0.3 と rsvelte の tsc 7.0.2 の版差（TS2345 と TS2740、スプレッド型の印字順）で、`reason` にオラクル自身の仮想コードを tsc 7.0.2 に通すと rsvelte の指摘になることを書いてある。
- `expect` / `replace` は JS の断片で書く。1 文の式文は、対象が文でない限り式として解釈する。
- **ガード付き**である。`at` のノードが `expect` と一致したときにだけ置き換える。

オラクルが変わったとき（R5）は、各調整を 4 状態に判定する。

| 状態 | 意味 | 対応 |
|---|---|---|
| `ok` | `at` に `expect` がある | そのまま |
| `rebased` | `at` には無いが、木全体でちょうど 1 か所に `expect` がある（snapshot の構造がずれた） | `fixtures adjust --write` で `at` を書き換える。variant を固定していない調整は、variant ごとにずれ方が違いうるので手で直す |
| `redundant` | `at` に既に `replace` がある（オラクルがこちらに合わせてきた） | 調整を削除する |
| `stale` | `expect` が 0 か所または複数か所にある | 人が判断する |

`fixtures adjust` は、`ok` 以外が 1 件でもあれば終了コード 1 を返す。

この仕組みは、bits-ui の 612 unit で対照を当てて確認した。
1. 改変していない候補は 651 行すべて一致した。
2. `void 0` を `undefined` に 1 か所書き換えた候補は、ちょうど 1 件の不一致になり、報告されたパスは上のとおりだった。
3. 調整を足すと、再び全件一致した。
4. snapshot をずらして 4 状態を再現した。
   - 文を 1 つ挿入すると `rebased` になり、`--write` で `at` が更新されて `ok` に戻った。TOML のコメントは保持された。
   - 対象を `undefined` に変えると `redundant` になった。
   - `null` に変えると `stale` になった。

## 8. Svelte の版上げ（`fixtures upgrade`）

1. `tools/fixtures/package.json` の `svelte` を新しい版の exact pin に変えて、`pnpm install` する。
2. `mise exec -- node tools/fixtures/bin/fixtures.ts upgrade` を実行する。全タスクを再生成し、全調整を再検証する。
3. 結果をレビューする。
   - `git diff --stat -- ':(glob)fixtures/**/expected/**'`: **変わった snapshot の一つひとつが、上流の挙動変化**である。
   - `rebased` は `fixtures adjust --write` で書き換え、`redundant` は削除し、`stale` は判断する。
4. snapshot、調整、`oracles.json`、lockfile を **1 コミット**にまとめる（例: `oracle: svelte 5.57.1 → 5.58.0`）。そのコミットの後で実装側が落とす fixture が、追従すべき作業の一覧になる。

admission（どのファイルが runes 互換か）も、オラクルの版に依存する。版上げのときは、`import --from …` も再実行して manifest の差分を見る。取り込み元を新しい commit に進めたい場合は、チェックアウトを更新してから `--accept-commit` を付ける。

## 9. 拡張（R7・R8）

### 新しい言語（Vue、HTML、CSS、Markdown、…）

1. `languages.ts` に、`family`（最上位ディレクトリ。例: `vue`）、`ext`、`matches`（担当する拡張子）と `admit`（受け入れ条件。可能ならその言語のオラクルでパースできること）を足す。
2. その言語を含むリポジトリを、ライセンスを審査したうえで `sources.json` に足す。
3. その言語に当てるタスク（`vue.compile` なら `@vue/compiler-sfc` をオラクルにする、など）を `tasks/` に足し、オラクルのパッケージを `package.json` に exact pin する。

### Tailwind 付き Svelte などの「文脈」が要る unit

Tailwind のクラス並べ替えや lint、型検査、preprocess は、ファイル単体では決まらない。次の形で拡張する（未実装）。

- `sources.json` の source に `contexts: [{ name, files: [...] }]` を宣言する（Tailwind の CSS エントリ、`tsconfig.json`、`svelte.config.js` など）。importer は、同じライセンス規則で `fixtures/contexts/<source>/<name>/` にコピーする。
- unit の `meta.json` に `context: "<name>"` を持たせる。文脈を要するタスクは、`appliesTo` で文脈の有無を見る。
- 例: タスク `tailwind.sort`（オラクルは prettier-plugin-tailwindcss）、`svelte.check`（オラクルは svelte-check、成果物は diagnostics の JSON）。

### まだ無いタスク

lint・format・型検査はタスクになった（§5）。残りは次のとおり。

| task（予定） | オラクル | 成果物と比較方法 | storage |
|---|---|---|---|
| `svelte.parse` | `svelte/compiler` の `parse(modern)` | AST の JSON。入力の約 16 倍になるので cached | cached |
| `js.parse` | acorn / typescript-estree | canonical AST（パーサ適合性、concept C10） | cached |

タスクごとに比較方法を選べる（`js-syntax_tree` / `text` / `json` / `lint`）。したがって「AST 比較」は compile の JS に限った選択であって、仕組み全体の制約ではない。format は書式そのものが仕様なので `text`（バイト一致）、型検査の JSON は位置とメッセージまで比べる。

### ユニット単位の例外

unit の `fixture.toml` に書く。いまは `[skip]`（task id または `task/variant` → 理由）と `[[adjust]]` を持つ。skip の例: `vue/rsvelte/check/template-shapes.vue` と `vue/rsvelte/lint/button-types.vue` は、rsvelte の compile の移植が拒否する構文（束縛した `class`、`type` と `:type` の重複）を含むので `vue.compile/default` を外している。どちらも別のタスクを測るための unit である。今後、lint 設定の差し替えやコンパイルオプション（`experimental.async` など）といった、タスク固有の per-unit オプションもここに置く。

## 10. 実装との接続

### 出力を書く（`rsvelte fixtures`）

```
./target/release/rsvelte fixtures <dir>... [--task <id>]... [--tsc <tsc>] [--svelte <pkg>] [--vue <pkg>] [--tsconfig <file>]
```

- 与えたディレクトリ（複数可）の下の全 unit に、登録された全タスクを走らせ、`actual/<task>/<variant>.<ext>` に書く（`expected/` と同じ名前）。
- 診断を出したタスクは `<variant>.diagnostics.json` も書く。拒否したタスク（`Unsupported`）は成果物を書かず、これだけを残す。
- `filename`（コンポーネント名と CSS のスコープハッシュに入る）は、どのディレクトリを与えても unit の source ディレクトリ（`fixtures/<family>/<source>`）からの相対パスになる。以前は与えたディレクトリからの相対で、コーパスの unit が `<source>/<path>` という名前でコンパイルされ、ハーネスのせいで不一致に数えられていた。直した結果、js の match が client 1026 → 1140、server 1022 → 1136、css の match が 27 → 154 に増えた（`c4078b13b3`）。
- `tools/fixtures/bin/run-all.ts` は、全ファミリーのディレクトリに対して 1 回の `rsvelte fixtures` を走らせる。型検査にはオラクル自身の TypeScript 7 と、オラクルの `svelte` / `vue` パッケージを渡す。

### 比べる（`fixtures compare`）

- `mise exec -- node tools/fixtures/bin/fixtures.ts compare --task svelte.compile --variant client [--family svelte] [--source id,...] [--report <file>]`
- verdict は `match` / `mismatch` / `missing` / `unexpected` / `unparseable` の 5 種類。
- 画面に出すのは先頭 20 件だけで、`… and N more` を必ず添える。全件は `--report` のファイルに書く。
- canonical AST（§6）の実装は Node 側の 1 つだけで、Rust 側は出力を書くだけ。

### 正しさのラチェット（`fixtures check`）

- 全タスク × 全 variant × 全 unit の判定を `fixtures/_registry/parity.json` と比べる。判定は unit ごとに 1 つで、`match` か、成果物の中で最も悪い verdict（`unexpected` < `missing` < `mismatch` < `unparseable`）。
- rsvelte が拒否した unit（オラクルが出力を持つのに `diagnostics.json` しか書かなかったもの）は載せない。unit が拒否されるようになるとエントリが消え、新たに対応するとエントリが増える。
- 二方向: `parity.json` との違いは、改善も含めてすべて `MOVED <前> -> <後> <task>/<variant> <unit>` と印字されて失敗する。意図した変化は、その変更の中で `fixtures check --update` で記録する。
- 一覧に件数の上限はない。CI のログが、そのまま re-baseline の根拠になる。
- `201b86fd6b` 時点で 3,068 エントリ。拒否されて載っていない unit は `893f2cf1c7` の時点で 16,071 件。
- 対照: ある unit の整形出力の末尾に 1 文字足すと、`MOVED match -> mismatch svelte.format/default …` で失敗する（`893f2cf1c7`）。

### CI

`.github/workflows/ci.yml` の `fixtures` ジョブが、release ビルドの `rsvelte` で `run-all.ts`、`fixtures check`、`fixtures adjust`、ツール群の型検査を順に走らせる。push（`main`、`experimental`）とすべての pull request が対象。

## 11. 未決事項

| 項目 | 状態 |
|---|---|
| `svelte.compileModule` の実装側 | rsvelte のモジュール（`.svelte.js`）用タスクが未実装なので、38 unit すべてが両ターゲットで `missing` |
| `.svelte.ts` の compile のオラクル | 上流では、Vite が型を剥がしてから `compileModule` に渡す。どのストリッパ（Vite が使う oxc transform か、typescript か）をオラクルにするかが未決。決まるまで compile タスクは当てない |
| CSS の比較 | 現在はテキストの完全一致。CSS の AST 比較は、CSS パーサを実装するときに決める |
| 生成コーパス（matrix / mutation） | 実コーパスだけでは相互作用のバグが出ない。旧 `pattern-corpus` はライセンス上の理由で除外したので、生成器を作り直して `fixtures/` に別の source として置く |
| 並列化 | regen は 1 スレッドで 107 s。タスクが増えたら worker に分ける |
| `experimental.async` を使う runes ファイル | `await` を使うコンポーネント 304 件が、`experimental_async` で admission に落ちている。legacy ではなく、元プロジェクトが `svelte.config` で有効にしている正しい runes ファイル。per-unit のコンパイルオプション（`fixture.toml`、または source 単位の既定値）を入れてから取り込む |
| svelte 本体のテスト fixture | 本体の `_config.js` にあるコンパイルオプション（`dev` など）は、まだ取り込んでいない。取り込むまでは既定オプションの unit として扱う |
