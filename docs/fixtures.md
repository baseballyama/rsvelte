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
- **最上位を言語ファミリーで分ける。** いまのファミリーは `svelte`、`vue`、`cross` の 3 つ。Svelte と Vue が混ざらない。`cross` は、別のランタイム向けにコンパイルする（`.vue` → Svelte ランタイム、`.svelte` → Vue ランタイム）unit で、振る舞いのオラクル（§12）だけを当てる。Tailwind 付き Svelte は言語ではなく文脈なので、`svelte/` の下に置く（§9）。
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
   - `cross-vue` / `cross-svelte`（ファミリー `cross`、手書きのみ）: 公式ツールチェーンでビルドできること（§12.2）。
7. unit ディレクトリに `input<ext>` と `meta.json` を書き、LICENSE の写しを置く。上流で消えた unit はディレクトリごと消す。ただし `fixture.toml`（手書き）を持つ unit は消さずに残して列挙し、終了コードを 1 にする。

### 2026-09-29 時点の取り込み結果

対象は `svelte` ファミリー。`vue` のユニットは、いまは手書きの `rsvelte` source（`fixtures/vue/rsvelte` 28 件）だけで、取り込み元のリポジトリはまだ無い。

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
| `svue.compile` | `cross` の `.vue`（言語 `cross-vue`） | `client`、`server` | @vue/compiler-sfc + vue（+ jsdom） | `trace.json`（実装の `js` を Svelte ランタイムで動かした trace と比較、§12） |
| `vuelte.compile` | `cross` の `.svelte`（言語 `cross-svelte`） | `client`、`server` | svelte（+ jsdom） | `trace.json`（実装の `js` を Vue ランタイムで動かした trace と比較、§12） |

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

unit の `fixture.toml` に書く。いまは `[skip]`（task id または `task/variant` → 理由）、`[[adjust]]`、`[behaviour]`（振る舞いタスクの props と操作手順、§12.4）を持つ。skip の例: `vue/rsvelte/check/template-shapes.vue` と `vue/rsvelte/lint/button-types.vue` は、rsvelte の compile の移植が拒否する構文（束縛した `class`、`type` と `:type` の重複）を含むので `vue.compile/default` を外している。どちらも別のタスクを測るための unit である。今後、lint 設定の差し替えやコンパイルオプション（`experimental.async` など）といった、タスク固有の per-unit オプションもここに置く。

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
- 振る舞いタスク（§12）では、実装の `actual/<task>/<variant>.js` から trace を取り、それを期待値の `trace.json` と比べる（`Task.observe`）。
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
| 振る舞いの比較範囲 | trace は DOM とフォームのプロパティだけを見る。CSS（どのスタイルが当たるか）、hydration（SSR の HTML に client を被せる経路）、IME の composition、フォーカス、タイマーや `fetch` を待つ非同期の更新は比べない（§12.4、§12.8） |
| svelte 本体のテスト fixture | 本体の `_config.js` にあるコンパイルオプション（`dev` など）は、まだ取り込んでいない。取り込むまでは既定オプションの unit として扱う |

## 12. 振る舞いのオラクル（別ランタイム向けのコンパイル）

- 実装: `tools/fixtures/src/behaviour/`（`official.ts`、`runtime.ts`、`client.ts`、`server.ts`、`dom.ts`、`modules.ts`）と `tools/fixtures/src/tasks/behaviour.ts`
- オラクル自身のテスト: `tools/fixtures/test/behaviour.test.ts`（`pnpm test`、CI の `fixtures` ジョブ）

### 12.1 何を正しいとするか

`svue`（`.vue` を Svelte ランタイム向けにコンパイルする）と `vuelte`（`.svelte` を Vue ランタイム向けにコンパイルする）には、上流のコンパイラが存在しない。したがって「公式の出力とバイト一致／AST 一致」は定義できない。代わりに、**元の言語の公式ツールチェーンと同じ振る舞いをすること**を正しさとする。

- **期待値**: 元のコンポーネントを、その言語の公式コンパイラでビルドする（`.vue` は `@vue/compiler-sfc`、`.svelte` は `svelte/compiler`）。それを元の言語のランタイムで DOM にマウントし、unit の操作手順を順に実行して、マウント直後と各手順の後の正規化した DOM を記録する。SSR は、`vue/server-renderer` の `renderToString` か `svelte/server` の `render` の HTML を、同じ規則で正規化して記録する。これが trace で、`fixtures regen` が `expected/<task>/<variant>.trace.json` に書く。
- **実装側**: rsvelte が出力した、もう一方のランタイム向けの JS（§12.3）を、そのランタイムで同じようにマウントし、同じ props と同じ手順で trace を取る。
- **判定**: 2 つの trace が等しければ `match`。違えば `mismatch` で、最初に違う手順と行を報告する（例: `step 3 {"click":"button.remove"}: line 3: expected "1. banana", actual "1. item 3"`）。

公式のビルドが自分の手順で例外を出したら（セレクタに一致する要素が無い、など）、regen はその unit で失敗する。期待値に例外は入らない。

### 12.2 unit の置き場所と言語

```
fixtures/cross/rsvelte/<グループ>/<名前>.vue/      言語 cross-vue    → svue.compile
  input.vue  meta.json  fixture.toml  expected/svue.compile/{client,server}.trace.json
fixtures/cross/rsvelte/<グループ>/<名前>.svelte/   言語 cross-svelte → vuelte.compile
  input.svelte  meta.json  fixture.toml  expected/vuelte.compile/{client,server}.trace.json
```

- ファミリー `cross` には言語が 2 つある。`cross-vue`（`.vue`、admission は公式ビルドが client と server の両方で通ること）と `cross-svelte`（`.svelte`、admission は `runes: true` の compile が通ること）。`vue` / `svelte` ファミリーの unit には振る舞いタスクは当たらず、`cross` の unit には compile・lint などのタスクは当たらない。
  - 手書き unit の言語は、拡張子だけでなくファミリーでも決める（`languageOf(path, family)`）。取り込み元リポジトリのファイルは、従来どおり `svelte` / `vue` に入る。
- いまの unit は 12 組・24 件で、どの `.vue` にも、同じ振る舞いを手で書いた `.svelte` の双子がある（逆も同じ）。
  - `minimal/`: counter、conditional、list、text-input、checkbox、props、form-controls、todo。
  - `semantics/`: 2 つのランタイムの意味が違うところ（§12.8）。number-input、interpolation、boolean-prop、fallthrough。
- `rsvelte fixtures` はファミリーを区別しないので、`cross` の unit にも `vue.compile` などを走らせて `actual/` に書く。Node 側はそれを比べない。

### 12.3 実装が書くファイル（Rust 側の契約）

| タスク | 書くファイル | モジュールの形 | マウントのしかた |
|---|---|---|---|
| `svue.compile/client` | `actual/svue.compile/client.js` | `svelte/compiler` が `generate: 'client'` で出す形。コンポーネントを `export default` する | `mount(C, { target, props })`（`svelte`）、各手順の後に `flushSync()` |
| `svue.compile/server` | `actual/svue.compile/server.js` | `generate: 'server'` で出す形。`export default` | `render(C, { props }).body`（`svelte/server`） |
| `vuelte.compile/client` | `actual/vuelte.compile/client.js` | `@vitejs/plugin-vue` のクライアントビルドが出すコンポーネント（`setup` が render 関数を返す、または `render` を持つオブジェクト）を `export default` する | `createApp(C, props).mount(el)`（`vue`）、各手順の後に `nextTick()` |
| `vuelte.compile/server` | `actual/vuelte.compile/server.js` | SSR ビルドのコンポーネント（`ssrRender`、`__ssrInlineRender` 付きで `setup` が SSR render 関数を返すもの、または vnode の render 関数）を `export default` する | `renderToString(createSSRApp(C, props))`（`vue/server-renderer`） |

- Rust のタスク名は `svue.compile/client` のように `<task>/<variant>` にし、成果物の名前を `js` にする。`rsvelte fixtures` は `actual/<task>/<variant>.<name>` に書くので、上の表のパスになる。
- 拒否する unit には、従来どおり `<variant>.diagnostics.json` だけを書く。`fixtures check` はそれを「拒否」として数え、`parity.json` に載せない。
- モジュールが import してよいのは、ランタイムのパッケージ（`svelte`、`svelte/*`、`vue`、`@vue/*`）だけ。これらは `tools/fixtures` に pin した版に解決される（期待値側と同じ 1 つのコピー）。`svelte` は、client では `browser` 条件付き（バンドラのクライアントビルドと同じ）で解決し、server では付けない。相対 import や他のパッケージは解決できず、`load:` のエラーになる。
- 比較の前に、`client.js` / `server.js` を acorn でパースする。パースできなければ `unparseable`。読み込みやマウントで例外が出たら、それが trace に入って `mismatch` になる。
- `fixtures compare` は、実装側の trace を `actual/<task>/<variant>.trace.json` に書く（調べるため。比較には使わない）。
- `svue.compile` の実装は `crates/languages/vue/compile_svelte`。翻訳の対応表、拒否の一覧、trace に映らない差はクレートの doc に書いてある。

### 12.4 操作手順（`fixture.toml` の `[behaviour]`）

```toml
[behaviour]
props = { start = 5 }                      # ルートコンポーネントの props（省略可）
steps = [
  { click = "button.inc" },                # el.click()。チェックボックスの切り替えと input/change、label の活性化、submit ボタンによる送信まで、ブラウザの既定動作を含む
  { input = ["input.name", "Ada"] },       # .value を設定して input（InputEvent、inputType insertText）
  { change = "input.note" },               # change（入力の確定。v-model.lazy が待つもの）
  { select = ["select.size", "l"] },       # <select> の .value を設定して input と change
  { key = ["input.draft", "Escape"] },     # keydown と keyup（key を指定）
  { submit = "form.new" },                 # submit（cancelable）
]
```

- 手順は 1 つにつき動作が 1 つ。対象は、マウント先の中でセレクタに最初に一致する要素。一致しなければ、その手順でエラーになって trace が終わる。
- `meta.json` ではなく `fixture.toml` に置く。`meta.json` は `fixtures import` が毎回作り直すので、手書きの内容は消える。
- 各手順の後、ランタイムの flush（Svelte は `flushSync()`、Vue は `nextTick()`）、`setTimeout(0)` 1 回、もう一度 flush をしてから DOM を記録する。同じイベントの中で、どの時点で描画するか（同期かマイクロタスクか）は比べない。利用者には、その違いは見えないため。

### 12.5 trace の形式

```json
{ "steps": [
  { "do": "mount", "dom": ["<button class=\"inc\">", "  \"clicks: 0\"", "</button>"] },
  { "do": { "click": "button.inc" }, "dom": ["…"], "errors": ["Uncaught [Error: …]"] }
] }
```

- `client.trace.json` は `steps`。`do` は `"mount"` か手順そのもの。`dom` は正規化した DOM で、要素 1 つかテキスト 1 つにつき 1 行。子は 2 空白ずつ字下げする。
- `errors` は、その手順の間にイベントリスナーから投げられた例外（jsdom の報告）。無ければキーごと無い。
- 手順が例外で止まった場合は、その手順が `{ "do": …, "error": "…" }` になり、trace はそこで終わる。
- `server.trace.json` は `{ "html": [ … ] }`。読み込みや描画が失敗した場合は `{ "error": "load: …" }` か `{ "error": "render: …" }`。
- 要素の行は `<タグ 属性="値" … .プロパティ=値>`。属性は名前順で、値は JSON 文字列。プロパティは `.` で始まる。

### 12.6 正規化の規則

利用者に見えるものを比べ、どちらかのランタイムの実装の都合でしかないものは比べない。仕様は `tools/fixtures/src/behaviour/dom.ts` の冒頭のコメントで、内容は次のとおり。

| 規則 | 理由 | 隠さないもの |
|---|---|---|
| コメントノードを落とす。落としたコメントの両側のテキストはつなげる | Svelte のアンカー（`<!---->`、`<!--[-->`）と Vue のフラグメントの目印（`<!--[-->`、`<!--]-->`、`<!--v-if-->`）は何も描画しない | テキストそのもの |
| `data-v-<hash>` 属性と、`svelte-<hash>` クラスを落とす | どちらも自分のスタイルのスコープ用で、スタイルは比べない | `svelte-` 以外のクラス。`svelte-1x2y3z extra` と `extra` が無いものは違う |
| 属性を名前順にする。クラスのトークンを重複除去してソートする。`style` を宣言ごとに読み直して `プロパティ: 値` のソート済みの列にする | CSS はどの順序も読まない | 属性の値、クラスの有無、宣言の値 |
| 空になった `class` / `style` 属性は落とす | `class=""` と属性なしは見た目が同じ（Vue は空のクラス束縛で `class=""` を残す） | — |
| テキストは CSS の `white-space: normal` に従う。空白の連続を 1 つの空白にし、ブロックの境界（ブロックレベルの親の端、ブロックレベルの兄弟や `<br>` の隣）にある空白は落とす | その位置の空白は描画されない | インライン要素の間の空白。`<b>a</b> <b>b</b>` と `<b>a</b><b>b</b>` は見た目が違うので、違うものとして残る |
| `<pre>` の中のテキストはそのまま残す | 空白がそのまま描画される | — |
| フォームのプロパティを記録する: `<input>`（checkbox と radio 以外）・`<textarea>`・`<select>` の `.value`、checkbox と radio の `.checked`、`<option>` の `.selected`。`<textarea>` の子（初期値でしかない）は `.value` で置き換える | `v-model` も `bind:` も、属性ではなくプロパティに書く。属性だけを見ると、入力欄に見えている値を比べられない | — |

- インライン要素の端は境界として扱わない。行頭に来たインライン要素の端の空白のように、見えない違いを報告してしまうことはありうるが、見える違いを隠すことはない。
- ブロックレベルかどうかは、HTML の既定の表示（`div`、`p`、`li`、`ul`、`form`、`table` の各要素、`option` など）で決める。CSS で `display` を変えたものは見ない。
- SSR の HTML は、ブラウザがブロックのコンテナの中にパースするのと同じように jsdom でパースしてから、同じ規則で正規化する。属性 `value` や `checked` も、パースした結果のプロパティとして記録される。
- 正規化の両方向（隠すべきものが消え、見えるものが残る）は、`behaviour.test.ts` の最後のテストに 23 組の HTML として固定してある。

### 12.7 実行環境

- DOM は jsdom 30.1.1（exact pin）。Svelte 本体と Vue 本体のテストが使う DOM でもある。`window` を 1 つ作り、その DOM のクラスと `document` をグローバルに置いてから、両方のランタイムを読み込む（Vue の runtime-dom は、読み込んだ時点で `document` を掴む）。Node 自身の `Event` 系のクラスは jsdom のものに置き換える（jsdom は自分のイベントしか配送しない）。
- client の trace は worker スレッドの中で取る。同じプロセスで走る他のタスク（prettier、eslint、vue-tsc など）に DOM のグローバルを漏らさないため。全タスクの regen の前後で、振る舞いタスク以外の snapshot が 1 つも変わらないことを確かめてある。
- SSR はさらに別の worker スレッドで描画する。サーバーのコードは、`window` も `document` も存在しない場所で動くべきだから。対照: `typeof window === 'undefined'` で初期値を変える翻訳は、server だけが `mismatch` になる（`counter-server-only.svelte`）。
- unit ごとに新しいコンテナ（`<body>` の子の `<div>`）にマウントし、終わったらアンマウントして取り除く。ランタイムのモジュールはプロセスに 1 つずつで、期待値側と実装側が共有する。
- Vue は Node の既定の入口（開発ビルド）で動かし、警告は `app.config.warnHandler` で捨てる。`NODE_ENV` は変えない。同じプロセスの他のタスクが使う `@vue/compiler-dom` の選ぶビルドまで変わってしまうため。

### 12.8 2 つのランタイムの意味の違い（オラクルが表に出すもの）

いずれも、公式どうしで同じ見た目の書き方をすると振る舞いが違うことを、オラクルで実測したもの。翻訳器が扱う必要がある。

| 違い | Vue | Svelte | 実測した unit / 対照 |
|---|---|---|---|
| 要素の間の改行を含む空白 | `whitespace: 'condense'` が、改行を含む空白だけのテキストを消す | 1 つの空白として残す | インライン要素の間では見える違い。`minimal/counter`、対照 `counter-whitespace.svelte` |
| 改行を含まない要素間の空白 | 1 つの空白に縮めて残す | 同じ | `minimal/todo` の `<span>…</span> <span>…</span>`（違いなし） |
| `v-model.lazy` | `change` で更新する | 対応する束縛が無い。`value={x}` と `onchange` で書く | `minimal/form-controls`、対照 `form-controls-eager.svelte`、`text-input-lazy.vue` |
| 数値の入力欄の `v-model` / `bind:value` | `parseFloat` し、NaN なら文字列のまま（`''` は `''`）。モデルと数値が等しい間は入力欄を書き換えない（`2.50` が残る） | `bind:value` は数値か `null`（`''` は `null`） | `semantics/number-input`、対照 `number-input-bind.svelte`（`""` を入れた手順で `string` と `object` が分かれる） |
| 補間の値の表示 | `toDisplayString`: オブジェクトと配列は 2 空白字下げの JSON、`null` / `undefined` は空 | `String(value)`（`[object Object]`、`x,y`）。`null` / `undefined` は空 | `semantics/interpolation`、対照 `interpolation-naive.svelte` |
| 渡されなかった `Boolean` の prop | `false` | 既定値が無ければ `undefined` | `semantics/boolean-prop`、対照 `boolean-prop-naive.svelte` |
| 宣言していない属性（`$attrs`） | ルート要素が 1 つなら、そこに引き継ぎ、`class` は結合する | 引き継がない（`...rest` を明示的に展開する） | `semantics/fallthrough`、対照 `fallthrough-naive.svelte` |
| テキストの `v-model` と `bind:value` のイベント | `input`（composition 中は更新しない。`vModelText` のソースより） | `input` | 通常の入力では同じ（`minimal/text-input`）。composition は語彙に無く未測定 |
| チェックボックス・`<select>` | `change` | `change` | 同じ（`minimal/checkbox`、`minimal/form-controls`）。`label` のクリックでも切り替わる |
| 空のクラス束縛 | `class=""` を残す | 属性を付けない | 見た目は同じなので正規化で吸収する（§12.6） |
| 描画のタイミング | `nextTick`（マイクロタスク） | バッチをマイクロタスクで flush | 同じイベントの中の違いは比べない（§12.4）。ハンドラの中で DOM を同期的に読むコードでは見える違いになりうるが、未測定 |

### 12.9 オラクル自身の検証

オラクルを rsvelte の実装と独立に確かめるため、`behaviour.test.ts` は「正しい翻訳」と「誤った翻訳」を、もう一方の公式コンパイラで作って確かめる。`fixtures/` に、rsvelte の出力を装ったファイルは置かない。

1. **双子は一致する**: `cross` の各 unit について、双子（他方の言語で手書きした同じ振る舞いのコンポーネント）を公式コンパイラでビルドし、`compare` と同じ関数（`Task.observe`）で trace を取って、committed の期待値と比べる。24 unit × 2 ターゲットのすべてが一致する。
2. **誤った翻訳は、手順と差分を名指しして `mismatch` になる**: `test/behaviour/wrong/` の 20 ファイル（オフバイワン、手順の後に 1 件足りないリスト、入力欄の `.value` だけが違うもの、空白の扱い、`.lazy` の取り違え、リスナーの例外、server だけが違うもの、など）について、ターゲットごとの報告文を `test/behaviour/controls.json` に完全一致で固定してある。`null` は「そのターゲットは一致したままでなければならない」で、一方の誤りが他方を動かさないことの陰性側の確認になる。
3. **観測できない出力は報告される**: `export default` が無い、マウントで例外、解決できない import。
4. **正規化**: §12.6 の 23 組。

テスト自身の陽性対照として、オラクルに欠陥を入れて赤になることを確かめた（フォームのプロパティを記録しない → 1 と 2 が失敗、最初の手順を飛ばす → 1 と 2 が失敗。戻した後は全件成功）。

`fixtures compare` の経路も、手で置いた `actual/` で一度だけ確かめた（その後は削除）。正しい翻訳 → `match`、誤った翻訳 → 手順を名指した `mismatch`、壊れた JS → `unparseable`、`diagnostics.json` だけ → 拒否（`missing` と `unexpected`）。

### 12.10 vuelte の現状（`vuelte.compile`）

実装は `crates/languages/svelte/compile_vue`（対応表と拒否の一覧はその `lib.rs` の冒頭、設計は [architecture.md](architecture.md) の「vuelte」）。数は exp/cross と exp/svelte-ext をマージして spread などに対応したコミット（`6b5621c994`）の `run-all` と `fixtures check` のもの。

| unit | client | server |
|---|---|---|
| `minimal/` の 8 件（counter、conditional、list、text-input、checkbox、props、form-controls、todo） | match | match |
| `semantics/interpolation`、`number-input`、`boolean-prop` | match | match |
| `semantics/fallthrough` | match | match |

§12.8 の違いの扱い:

- 補間: Svelte の `set_text` / `escape` と同じ強制（`` `${e ?? ''}` `` / `String(e ?? '')`）にしてから `toDisplayString` に渡す。オブジェクトは JSON にならない。
- 要素間の空白: Svelte の `clean_nodes` が残したテキストを Vue の HIR に入れる。Vue の `condense` は HIR を作った後には走らない。
- 数値の入力欄の `bind:value`、form をリセットできるコンポーネントの束縛など、Svelte の束縛が Vue の状態と違う動きをするものは拒否する。テキスト・チェックボックス・静的な選択肢の `<select>` の束縛は、Svelte の client のランタイムの effect（`bind_value`、`bind_checked`、`bind_select_value`）を要素の関数 ref で再現する。
- 渡されなかった prop: `defineProps` に `type` を書かないので、Vue の Boolean への変換が起きず `undefined` か既定値になる。
- `$attrs`: 全コンポーネントに `inheritAttrs: false`。`let { ...rest } = $props()` は `useAttrs()` に写し（宣言していない属性で、Svelte の rest が宣言していない props を持つのと同じ）、テンプレートの spread でだけ読める。spread を持つ要素は全属性を属性順に 1 つのオブジェクトにまとめ、client は Svelte の `set_attributes`、server は `attributes` を移植したヘルパーに渡す（server は Vue の移植に足したオブジェクトの `v-bind` で出す）。これで `fallthrough` は両ターゲットで match になった。

コーパス（`run-all` の 17,582 unit）では、client が 685 件、server が 686 件を出力し、残りは拒否する（`diagnostics.json` が client 16,853 件・server 16,852 件。うち `vuelte_unsupported` は 7,607 件・7,606 件で、残りは Svelte プラグインが読まない文書）。panic は 0。マージの前は 673 / 674 件、マージして新しい構文（spread、`class:`、`{@attach}`）をすべて拒否した段階で 673 / 674 件（`vuelte_unsupported` 7,619 / 7,618 件）、対応した後が 685 / 686 件。

出力したものは、公式の Svelte の build と並べて、props も手順も渡さずにマウント（client）と `renderToString`（server）の trace を比べた（期待値の無いコーパスなので、マウント時点の振る舞いだけの確認）。client は 685 件中 663 件が一致、22 件は両方が同じ例外で一致。server は 686 件中 665 件が一致、20 件は両方が同じ例外、1 件（`props-default-value-function/inner`）は両方が例外で、メッセージの変数名だけが違う（Svelte は `getter is not a function`、vuelte は `$$props.getter is not a function`）。この比較で見つかった不一致は、写さずに拒否へ変えた: 共有の文字参照のデコーダが Svelte と違う読み方をする参照（`&rsaquo;`、`;` の無い `&quot`、`&#128;` など）、ブラウザが Svelte の client のテンプレートをパースし直すと消える・付け替わる要素（`<body>`、親の外にある表の部品）、`<select>` の中の豊かな内容、二度宣言した名前（Svelte は再宣言した `var` を再代入として読み、共有のスコープは最初の初期化子で畳み込む）。

拒否の多い順（client、メッセージの中の名前を `X` にまとめたもの）: 要素 `<X>`（コンポーネントや `svelte:` 要素、5,876）、パーサの `unexpected token`（1,868）、`{#if}` / `{#each}` 以外のブロック（1,734）、モジュールスクリプト（1,581）、未対応の指令（1,294）。新しい構文の拒否は、`<input>` などの上の spread 35、spread の横の束縛 19、spread の横のイベント属性 11、`{@attach}` 12、rest を spread 以外で読むもの 6。Vue の移植自身の拒否（`the Vue compiler: …`）は 11 件（Vue の HTML タグの表に無い要素名をコンポーネントとして扱うもの 8、など）で、翻訳がそれを出力の前に拒否していないところである。

