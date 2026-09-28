# fixtures

実プロジェクトからハードコピーした入力と、公式ツールが出力した snapshot を置く場所です。1 つの入力ファイル（unit）につき 1 ディレクトリを使い、その中に入力・期待値・実装の出力・手書きの調整をまとめて置きます。

設計の背景と運用の詳細は [docs/fixtures.md](../docs/fixtures.md) にあります。

## 全体の構成

```
fixtures/
├── README.md                  このファイル
├── _registry/                 言語をまたいで共有する台帳（言語ディレクトリと混ざらないよう _ を付けている）
│   ├── sources.json
│   ├── oracles.json
│   ├── import-report.json
│   └── licenses/<source>/…
└── <family>/                  言語ファミリー（現在は svelte のみ。今後 vue, html, css, … を追加）
    └── <source>/              取り込み元リポジトリの id（sources.json の id）
        └── <元のパス>/         unit ディレクトリ。例: svelte/bits-ui/src/lib/button.svelte/
            ├── input.svelte
            ├── meta.json
            ├── fixture.toml
            ├── expected/<task>/<variant>.<ext>
            ├── actual/<task>/<variant>.<ext>
            └── cache/<task>/<variant>.<ext>
```

## 各ファイルの役割

### `_registry/`

| ファイル | 役割 | 書くのは | git |
|---|---|---|---|
| `sources.json` | 取り込み元の台帳。id、URL、固定 commit、ローカルのチェックアウト位置、ライセンス（SPDX と LICENSE ファイル）を持つ。取り込まないものも、除外理由（`excluded`）付きで残す | 人（ライセンス審査）。commit は `import --accept-commit` でも更新される | ✓ |
| `oracles.json` | タスクごとに、snapshot を生成したオラクルの版（例: `svelte` 5.57.1）と、AST 正規化器の版（acorn）を記録する | `regen` | ✓ |
| `import-report.json` | 取り込み元ごとの件数（担当言語にマッチした数、採用数、重複数、除外理由ごとの数） | `import` | ✓ |
| `licenses/<source>/…` | 取り込んだファイルを律する LICENSE の写し（元のパスのまま） | `import` | ✓ |

### unit ディレクトリ（`<family>/<source>/<元のパス>/`）

| ファイル | 役割 | 書くのは | git |
|---|---|---|---|
| `input<ext>` | 取り込み元からハードコピーした入力。拡張子は言語が決める（`.svelte`、`.svelte.js`、`.svelte.ts`） | `import` | ✓ |
| `meta.json` | unit の属性。`lang`（言語）、`sha256`、`mode`（測定するモード。Svelte はすべて `runes`）、`inferredMode`（オプション無しで公式が推論したモード: `runes` / `neutral`） | `import` | ✓ |
| `fixture.toml` | 手書きの例外。`[skip]`（このタスク／variant を当てない理由）と `[[adjust]]`（期待側 AST のピンポイント調整）。**importer は触らない** | 人 | ✓ |
| `expected/<task>/<variant>.js` | オラクルの出力（JS）。比較は AST で行う | `regen` | ✓ |
| `expected/<task>/<variant>.css` | オラクルの出力（CSS）。比較はテキストの完全一致 | `regen` | ✓ |
| `expected/<task>/<variant>.warnings.json` | オラクルが出した警告（code、message、位置）。警告が無い unit には作らない | `regen` | ✓ |
| `expected/<task>/<variant>.error.json` | オラクルが compile エラーを投げた場合の、そのエラー。これ自体が期待値になる | `regen` | ✓ |
| `actual/<task>/<variant>.<ext>` | 実装（rsvelte）の出力。`expected/` と同じ名前で書く | 実装のテストハーネス | ✗ |
| `cache/<task>/<variant>.<ext>` | 巨大すぎてコミットしないタスク（`storage: 'cached'`）の snapshot | `regen` | ✗ |

`<task>` はタスク id（`svelte.compile`、`svelte.compileModule`）、`<variant>` はオプションの組の名前（`client`、`server`）です。

## 元のパスが予約名と衝突する場合

元のパスの要素が `expected`、`actual`、`cache`、`meta.json`、`fixture.toml`、`input.*` のいずれかと同じ名前なら、先頭に `~` を付けて保存します。すでに `~` で始まる要素にも `~` を 1 つ足すので、元のパスは一意に復元できます。

例: svelte 本体のテストの `…/samples/foo/input.svelte` は、`…/samples/foo/~input.svelte/input.svelte` になります。

オラクルや実装に `filename` として渡すのは、復元した**元のパス**です。

## よく使うコマンド

`mise.toml` で固定した Node 26 で、TypeScript のまま実行します。

```sh
cd tools/fixtures && pnpm install                                 # 初回のみ
F="tools/fixtures/bin/fixtures.ts"
mise exec -- node $F stats                                        # unit 数とタスクの適用数
mise exec -- node $F compare --task svelte.compile --variant client --report /tmp/r.txt
mise exec -- node $F adjust                                       # 調整の再検証（--write で rebased を書き換え）
mise exec -- node $F upgrade                                      # オラクルの版上げ後: 全再生成＋調整の再検証
mise exec -- node $F import --from <submodule を持つチェックアウト>   # 取り込み元からの再取り込み
```

zsh では、`$F` にオプションまで入れると 1 語として扱われます。上のようにパスだけを入れてください。

## 著作権

入力ファイルの著作権は、各取り込み元に帰属します。各ファイルを律するライセンスは `_registry/licenses/<source>/` にあり、取り込み元の URL と commit は `_registry/sources.json` にあります。
