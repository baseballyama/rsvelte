# コンパイル時間 — 計測の仕方とベースライン

- 日付: 2026-09-29
- 実装: `tools/buildtime/`（TypeScript。Node 26 でそのまま実行する。依存なし）
- 実行: `mise run buildtime`（`--rounds N`、`--only name,...`、`--json <file>`、`--timings`、`--allow-busy`）
- ベースラインの JSON: [buildtime/baseline-39b65e423e.json](buildtime/baseline-39b65e423e.json)

Rust ワークスペース自体のコンパイル時間を、実行時の性能と同じく一つの指標として扱う。
ツールチェーンは `rust-toolchain.toml` で固定しているので、同じマシンなら commit 間の比較になる。

## 1. シナリオ

| 名前 | 測るもの |
|---|---|
| `check.clean` | `cargo check --workspace --all-targets --all-features` を空の target から |
| `clippy.clean` | lint ゲート（clippy）を空の target から |
| `debug.clean` | 全ターゲット（テスト込み）の debug ビルドを空の target から |
| `release.clean` | 出荷する `rsv` バイナリ（release: thin LTO、codegen-units 1）を空の target から |
| `debug.incr.<crate>.<kind>` | 温まった target で 1 ファイルを編集した後の、全ターゲットの debug ビルド |

`<crate>` は依存グラフの根 `kernel`（`crates/rsv_kernel/src/lib.rs`）と葉 `svelte`（`crates/rsv_svelte/src/lib.rs`）。
`<kind>` は編集の種類:

- `touch`: バイトは変えず mtime だけ動かす（編集・コンパイルの一巡の下限）
- `body`: private 関数を 1 つ足す（公開面は変わらない）
- `api`: 公開定数を 1 つ足す（依存するクレートがすべて再コンパイルされる）

## 2. 測り方の約束

- 各シナリオは専用の target（`target/buildtime/<scenario>`）で走る。`./target` は読まないし壊さない。
- シナリオはラウンドごとに交互に走らせ、マシンの変動を全シナリオに均等に配る。報告は中央値と最小・最大。
- clean は毎回 target を消す。依存は `--offline` でローカルのレジストリキャッシュから取るので、ダウンロード時間は入らない。`RUSTC_WRAPPER` は外す。
- 増分は、まず温め（計測しない）、編集して計測、ファイルを元のバイトに戻して再ビルド（計測しない）。編集対象に未コミットの変更があれば実行を拒否する（途中で落ちても作業を失わない）。
- 数値と一緒に、cargo が実際に rustc を走らせたパッケージ数を出す。0 なら「編集が何も再ビルドしなかった」ので、その場で失敗にする（何もしないビルドの時間を測った数字は出さない）。
- 開始時の 1 分 load average がコア数の 1/4 を超えていたら拒否する（`--allow-busy` で上書き）。実行中の load は測っているビルド自身を含むので、アイドルかどうかの判断には開始時の値だけを使う。
- `--timings` は測るビルドを遅くする（`check.clean` で 3.5 s → 6.4 s を観測）。なので `--timings` の実行はラウンドの後に別に行い、標本には入れない。レポートは `target/buildtime/timings/<scenario>/`。
- 記録するもの: git rev、Rust ソースと設定の dirty フラグ、rustc/cargo の版、ホスト、CPU、コア数、メモリ、OS、`RUSTFLAGS`、`CARGO_INCREMENTAL`。

## 3. ベースライン

`39b65e423e`（クリーン）、rustc 1.98.1、Apple M1 Pro 10 コア / 32 GiB、開始時 load 2.2、5 ラウンド。

| シナリオ | 中央値 | 最小 – 最大 | 再コンパイルしたパッケージ |
|---|---:|---:|---:|
| `check.clean` | 3.50 s | 3.37 – 4.27 | 14 |
| `clippy.clean` | 3.99 s | 3.97 – 4.05 | 14 |
| `debug.clean` | 4.95 s | 4.81 – 5.04 | 14 |
| `release.clean` | 10.46 s | 10.37 – 11.25 | 14 |
| `debug.incr.kernel.touch` | 1.29 s | 1.18 – 1.35 | 5 |
| `debug.incr.kernel.body` | 1.37 s | 1.22 – 1.42 | 5 |
| `debug.incr.kernel.api` | 1.35 s | 1.19 – 1.36 | 5 |
| `debug.incr.svelte.touch` | 0.81 s | 0.77 – 0.84 | 2 |
| `debug.incr.svelte.body` | 0.74 s | 0.73 – 0.93 | 2 |
| `debug.incr.svelte.api` | 0.85 s | 0.76 – 1.15 | 2 |

同じ commit で 3 ラウンドの先行計測もしており、中央値の差はどのシナリオも 0.1 s 以内だった。

`--timings` のレポートから読んだ、時間の大きい単位（並列に走るので合計は壁時計より長い）:

| ビルド | 単位 | 秒 |
|---|---|---:|
| release | `rsv`（bin。thin LTO で全体をここでコード生成する） | 3.53 |
| release | `rsv_svelte` | 3.39 |
| release | `rsv_js` | 2.52 |
| release | `rsv_kernel` | 1.61 |
| release | `rayon` | 1.22 |
| debug | `rsv_kernel` のテスト | 1.22 |
| debug | `rsv_cli` の build script の実行（git の sha を埋め込む） | 0.99 |

## 4. 未解明のこと

- 増分の 3 種類の編集で時間がほとんど変わらない。編集が rustc に届いていることは確かめた（`api` の編集で rustc が 7 回走る。壊れた編集ではビルドが失敗する）。ただし、`api` で依存クレートの作業が増えない理由はまだ測っていない。
- `rsv_cli` の build script が毎回約 1 s かかっている。増分のたびに走っているかどうかは未確認。
