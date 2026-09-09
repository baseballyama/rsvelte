---
name: perf-loop
description: Rust の性能改善を「計測 → 仮説 → 変更 → 再計測」のループで地道に回すためのスキル。プロファイラの選び方、Cargo の最適化設定、データ構造・アロケーション・ハッシュ・分岐などの定石をフェーズ順に適用する。1 回 1 変更 1 計測の規律を厳守する。rsvelte 固有の既知ボトルネック（`serde_json::Value` 駆逐、`bumpalo` 導入、`Atom<'a>`、codegen 直書き）と OXC 対応表、NAPI 検証手順も §7 に収録。「Rust の性能改善」「ボトルネック調査」「プロファイル取って最適化」などの依頼で使用。
argument-hint: "[focus area, e.g. parser | hot function name | 'continue']"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, WebSearch, WebFetch
effort: max
---

# Rust Performance Loop

## 0. 規律

1. 計測なき最適化は禁止。着手前にベースラインを取る。
2. 1 変更 = 1 計測。同時に複数を混ぜない。
3. 効かなければ revert。±5% はノイズ。
4. プロファイル上位 5 関数に入らないコードは触らない。
5. 毎周 `cargo test --release`。正しさ > 速さ。
6. 最適化後に読みにくくなったらアプローチを疑う。

## 1. ループ

```
baseline → profile → 仮説（N% 効くはず、を明文化）→ 1 変更 → test → 同条件で再計測
  → 改善: commit / 改善なし: revert + perf log に 1 行
```

止めどき: 上位 5 関数を触り目標の 80% 達成 / 残るホット関数が <5% / 次案が可読性を壊して期待 <5% / 3 周で 1% も動かない。

## 2. 計測ツール

| 目的 | ツール |
|---|---|
| E2E 実時間 | `hyperfine --warmup 3`（10 回以上） |
| 関数単位 | `criterion`（`crates/rsvelte_bench/benches/ci.rs`、CodSpeed） |
| CPU サンプリング | `samply`（第一選択）/ Instruments / `/usr/bin/sample` |
| アロケーション | `dhat` / `crates/rsvelte_devtools/src/bin/alloc_sites.rs` |
| キャッシュ・分岐 | `perf stat` / `cachegrind` |
| 生成コード | `cargo asm` / `--emit=llvm-ir`（最後の手段） |

## 3. ビルド設定（`Cargo.toml` に定義済み）

| profile | 用途 |
|---|---|
| `release` | `lto="fat"`, `codegen-units=1`, `panic="abort"`, `strip=false`, `debug=false` — 計測の基準 |
| `profiling` | `release` 継承、`lto="thin"`, `codegen-units=16`, `debug="line-tables-only"` — samply 用 |
| `bench` | criterion 用（常に unwind） |
| `dist` | 配布用（`strip="symbols"`） |

```bash
RUSTFLAGS="-C force-frame-pointers=yes" cargo build --profile profiling -p rsvelte_devtools --bin profiler
```

PGO: `scripts/perf/pgo.sh` が `pgo/rsvelte.profdata` を再生成、`scripts/perf/assert-pgo-profile.sh` が magic を検査（壊れた profile は **warning のみでビルドが通る**）。`scripts/bench/pgo-env.mjs` が cargo spawn に適用。

## 4. プレイブック（効く順）

| 段 | 手 | 典型 |
|---|---|---|
| A 構造 | ビッグオー / 中間表現削除 / 計算そのものの削除 / fast path | 桁 |
| B alloc | arena, `&str`/`Cow`, `SmallVec`, `compact_str`, `Box<[T]>`, `.clone()` 駆除, `with_capacity`, `format!`→`write!` | 2〜10x |
| C レイアウト | enum サイズを `size_of` assert で固定・大バリアント `Box`、`u32` 位置、フィールド順、SoA | 1.1〜1.5x |
| D ハッシュ | `FxHashMap`/`ahash`、小さければ線形探索、`phf` | 1.2〜2x |
| E ミクロ | `#[inline]`/`#[cold]`、branchless、`memchr`/SIMD、`from_utf8_unchecked`（要根拠） | 1.05〜1.3x |
| F 並列 | 単スレッドを絞ってから `rayon`。グローバル `Mutex` 禁止 | — |

アンチパターン: LLVM 既済みの手最適化 / マイクロ勝ちマクロ負け / コールド最適化 / 数値なしコミット。

## 5. 計測ハザード（この箱・このリポ固有）

- **静かな箱**: `ps -Ao %cpu=,comm= | sort -rn | head` の先頭を読む。`cargo==0` でも `mds_stores`/`mediaanalysisd` がビルド直後に 90% 超。陽性対照 `yes > /dev/null` が最上位に出ること。
- **比は時間で対にする**: official/rsvelte を同一ラウンド内で back-to-back、ABBA で順序交互。別々に測った比は drift。
- **壁時計でなく CPU 時間**: `perf_bench` の CPU median を読む。壁時計は負荷で 2 倍動く。
- **アームの同一性**: ファイル名・パス・ブランチは信用しない。`Compiling <crate> (<path>)` 行、2 成果物の `sha256`、出力での判別プローブ（含むべきもの／欠くべきもの両方）を読む。
- **worktree**: 毎回 `cd <worktree> && CARGO_TARGET_DIR=<worktree>/target cargo …`。cwd は黙ってリセットされる。
- **ディスク**: `df -g /System/Volumes/Data` が 20 GiB 未満なら cargo を起動しない。debug の `target/debug/deps` は 1 バイナリ ~140 MB × `ls crates/rsvelte_core/tests/*.rs | wc -l` 本（積を持ち歩かない — AGENTS.md 参照）。
- **分母**: 共有型（`JsNode` 等）を触ったら `--workspace`。`| tail`/`2>/dev/null` 越しに verdict を読まない。
- **call count を先に読む**: 決定的。時間は 1 回ではノイズ。
- **同居エージェント**: 計測窓の開始／終了は宣言で伝える。他人の窓の中で cargo を叩かない。
- **未測定は未測定と書く**: 未確定のまま入れた変更は全て戻された。

## 6. `$ARGUMENTS`

1. `continue` → 直近 perf log を読み次ループ。
2. 関数名／モジュール名 → そこに絞る。
3. 空 → samply で全体を測り上位 5 を提示（§7.1 の `--profile` 内訳は使わない）。
4. 順序厳守: baseline → profile → 仮説（ユーザー確認）→ 変更 → test → 再計測 → keep/revert。
5. 1 イテレーション 1 報告、3 周ごとに要約。

## 7. rsvelte 固有

### 7.1 計測コマンド

```bash
./scripts/bench/bench.sh --quick        # JS vs Rust 単線比較
./scripts/bench/bench.sh --criterion    # criterion
cargo build --release -p rsvelte_devtools --bin perf_bench
target/release/perf_bench --target client --runs 9 [--threads N] [--skip S --limit L]   # A/B の主計器
cargo build --profile profiling -p rsvelte_devtools --bin profiler
samply record target/profiling/profiler --file big.svelte --iterations 100
cargo build --profile profiling -p rsvelte_devtools --bin corpus_share_profile --features mimalloc-alloc
samply record --save-only -o prof.json.gz -r 1000 -- target/profiling/corpus_share_profile --iters 4
node scripts/bench/profile-shares.mjs prof.json.gz 30   # self/inclusive share 表
cargo run --release -p rsvelte_devtools --bin compile_profile -- --target server [--dev]  # フェーズ内訳
pnpm benchmark:reproduce                # サイト報告（scripts/reports/run-performance.mjs）
```

`profiler` / `bench.sh --profile` のフェーズ配分は本番経路と違う（retained script なし、TS 除去なし）。「parse:analyze:transform = X:Y:Z」の根拠に使わない。samply の相対ホットスポットには使える。

### 7.2 既知ボトルネック

| 項目 | 現状 | 手順 | grep |
|---|---|---|---|
| A `serde_json::Value` 駆逐 | 62 ファイルが依存。`JsNode`/`TypedExpr`（`crates/rsvelte_core/src/ast/typed_expr.rs`）へ寄せる | `Expression::Value` 生成箇所を `JsNode` に置換 → 不足バリアント追加 → ホットパスから外す | `rg 'serde_json::Value' crates/rsvelte_core/src -l` |
| B arena | `bumpalo` は依存に入り、`ast/arena.rs` は `JsNodeId` 索引アリーナ。lifetime 付き `Box<'a,T>`/`Vec<'a,T>` 化は未着手 | AST に `'a` 導入 → `Parser<'a>{alloc}` 貫通 → パーサ層から段階的に | `rg bumpalo crates/rsvelte_core/src` |
| C `Atom<'a>` | `CompactString`。重複はコピー | ソース直結の識別子を `&'a str` に → 生成文字列は arena → 頻出はインターン | — |
| D codegen 直書き | `JsNode` → 文字列の 2 段 | `String` バッファに `write!` 直書き、`with_capacity` | — |
| E `.clone()` | transform に多い | `&`/`Rc`/`Cow` | `rg '\.clone\(\)' crates/rsvelte_core/src/compiler/phases/3_transform -c` |
| F パーサ | Svelte テンプレートのみ自前 | `&[u8]` 走査、正規表現禁止、借用徹底 | — |

現状の数値と alloc 分析は `docs/phase3-ast-refactor-plan.md` を読む。

### 7.3 OXC 対応

| OXC | 役割 | 参照場面 |
|---|---|---|
| `oxc_allocator` | arena | 7.2 B |
| `oxc_ast` | typed AST | 7.2 A/B |
| `oxc_parser` | JS/TS parser | 7.2 F |
| `oxc_codegen` | codegen | 7.2 D |
| `oxc_span` | `Atom<'a>`/`Span` | 7.2 C |
| `oxc_syntax` | 演算子表 | キーワード判定 |

ソース: `ls ~/.cargo/registry/src/*/oxc_<crate>-*/src/`

### 7.4 NAPI 経由 E2E

```bash
cargo build --release -p rsvelte_napi --lib
node scripts/compat-corpus/binding.mjs --stage      # .corpus-cache/rsvelte.node
pnpm corpus:verify && pnpm corpus:matrix           # 出力バイト同一ゲート
cargo test --release                                # runtime/ssr/hydration
```

Vite 経路は `apps/npm/vite-plugin-svelte`。最終確認は必ず NAPI 経由。

## 8. References

- https://nnethercote.github.io/perf-book/
- https://oxc.rs/docs/learn/performance
- `docs/perf-baseline.md`（20x 目標の現状と計測記録）
