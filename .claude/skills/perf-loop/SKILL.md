---
name: perf-loop
description: Rust の性能改善を「計測 → 仮説 → 変更 → 再計測」のループで地道に回すための汎用スキル。プロファイラの選び方、Cargo の最適化設定、データ構造・アロケーション・ハッシュ・分岐などの定石をフェーズ順に適用する。1 回 1 変更 1 計測の規律を厳守する。rsvelte 専用ゴール（100x 達成）特化の `perf` スキルに対し、こちらは方法論と汎用テクニックに重きを置く補完スキル。「Rust の性能改善」「ボトルネック調査」「プロファイル取って最適化」などの依頼で使用。
argument-hint: "[focus area, e.g. parser | hot function name | 'continue']"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, WebSearch, WebFetch
effort: max
---

# Rust Performance Loop — Measure → Hypothesize → Change → Measure

## 0. 大原則（このスキルの背骨）

性能改善は **推測ではなく観測** で進める。以下のルールを毎ループ守る。

1. **計測なき最適化は禁止。** 着手前に必ずベースラインを取る。「速くなったはず」を許さない。
2. **1 変更 = 1 計測。** 複数の最適化を同時にコミットしない（効いたかどうかが分からなくなる）。
3. **効かなかったら revert。** 「ちょっと速くなったかも」を残さない。ノイズと改善を混同しない。
4. **ホットでない場所は触らない。** プロファイルで上位 5 関数に入らないコードは原則対象外。
5. **正しさは速さに優先する。** 各イテレーションの後に `cargo test --release` を必ず通す。
6. **シンプルに保つ。** 既存の `perf` スキルにある通り、複雑性を上塗りせず、データ構造・アルゴリズム自体をシンプルにする方向で攻める。最適化後のコードが前より読みにくくなったらアプローチを疑う。

## 1. 計測レイヤーの選び方

「どのツールで測るか」を間違えると、何時間も無駄になる。**目的に応じて使い分ける**。

| 目的 | 推奨ツール | 用途 |
|------|------------|------|
| エンドツーエンドの実時間 | `hyperfine` | バイナリ全体の比較。ノイズに対し統計処理してくれる |
| 関数単位の統計的マイクロベンチ | `criterion`（または `divan`） | 「この関数だけ X% 速くなった」を信頼区間つきで判定 |
| CPU サンプリングプロファイル | `samply`（推奨）／`cargo flamegraph`／`perf`（Linux）／Instruments（macOS） | ホットな関数・行を炎グラフで把握 |
| アロケーション量 | `dhat`（`dhat-rs`） | どこで何回 alloc しているか、ピークメモリ |
| キャッシュ・分岐ミス | `perf stat`／`cachegrind` | LLC ミス・branch miss 率の計測 |
| 生成コード（最後の手段） | `cargo asm`／`rustc --emit=llvm-ir` | LLVM が本当に最適化したかの確認 |

**デフォルトの一手目は `samply`**。`perf` よりセットアップが軽く、Firefox Profiler の UI で読みやすく、macOS / Linux 両対応。

```bash
cargo install samply hyperfine cargo-flamegraph dhat
# criterion は dev-dependencies に追加
```

### 計測精度を下げる地雷

- **debug ビルドで測る** → 桁違いに遅い。常に `--release`。
- **ウォームアップなしの初回実行** → I/O・JIT・ページキャッシュで歪む。`hyperfine --warmup 3` を基本にする。
- **電源管理（省電力モード、サーマルスロットリング）** → ノートで長時間測ると周波数が落ちる。電源接続・温度確認。
- **他のプロセスのノイズ** → ブラウザや Slack を閉じる。CI 上で比較するなら同じランナーで連続実行。
- **テストデータが小さい** → ボトルネックが現れない。本番相当のサイズで測る。
- **シングルランの差分で判断** → ±5〜10% は常にノイズ。`hyperfine` で 10 回以上回して有意差を見る。

## 2. リリースビルドの土台を作る

まず、プロファイルが読めるリリースビルドにする。これを忘れるとフレームグラフが空っぽになる。

`Cargo.toml`:

```toml
[profile.release]
debug = "line-tables-only"   # シンボルだけ残す（小さく、プロファイルは読める）
# 計測用プロファイルを別に切ると本番ビルドを汚さずに済む
[profile.profiling]
inherits = "release"
debug = "full"
strip = false
```

シンボル可読化とフレームポインタ:

```bash
RUSTFLAGS="-C force-frame-pointers=yes -C symbol-mangling-version=v0" \
  cargo build --profile profiling
```

ベンチ専用プロファイル（ベースラインを正確に取るため）:

```toml
[profile.bench]
inherits = "release"
debug = "line-tables-only"
```

## 3. The Loop（毎周こう回す）

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Baseline 計測（hyperfine / criterion で数値を記録）        │
│ 2. Profile（samply 等でホットスポット特定）                   │
│ 3. Hypothesize（「ここをこう変えれば N% 効くはず」を言語化）  │
│ 4. Change（1 つだけ変える）                                   │
│ 5. Test（cargo test --release で回帰がないか）                │
│ 6. Re-measure（同条件で再計測）                               │
│ 7. Decide:                                                   │
│      改善あり → コミット → 次のホットスポットへ              │
│      改善なし／劣化 → revert、仮説を記録、別の手を試す       │
└──────────────────────────────────────────────────────────────┘
```

各ループの所要時間は **30 分〜2 時間** が目安。1 日 1 ループしか回せないなら、計測コストが高すぎる（自動化を検討する）。

### ループの記録（毎周残すと判断が速くなる）

短い perf log を書き残すと、後で「もう試したか」「なぜ効かなかったか」を辿れる。1 周 1 行で十分:

```
2026-05-13  parse  baseline 142ms → hot: lex_identifier 31%
2026-05-13  parse  try: FxHashMap for keyword lookup           +0.3%  (noise) revert
2026-05-13  parse  try: byte-level whitespace skip             -8%    keep
2026-05-13  parse  try: SIMD memchr for `<`                    -3%    keep (small but consistent)
```

## 4. 最適化プレイブック（効く順）

**上から順に試す。** 下に行くほどリターン逓減、複雑性増加。

### A. アルゴリズム・データ構造（桁が変わる）

- O(n²) → O(n log n) の置き換えはマイクロ最適化 100 個に勝る。まずビッグオーを疑う。
- 不要な中間表現を削除する。「AST → IR → 文字列」を「AST → 文字列」にできないか。
- そもそも **そのコードは要るか？** 削除できる計算は最強の最適化。lazy 化・キャッシュも検討。
- ホットケース最適化: 「99% は空 / 1 要素 / 短い文字列」なら fast path を分岐させる。

### B. アロケーション削減（典型 2〜10x）

ヒープアロケーションは現代 CPU では非常に高価。プロファイルで `malloc`/`__rust_alloc`/`drop_in_place` が上位に来ていたら本セクション。

- **Arena allocator (`bumpalo`)**: AST など寿命を揃えられるノード群に。OXC で約 +20%。
- **Borrow over own**: `String` → `&str`／`Vec<T>` → `&[T]`／引数は `&str`、戻り値は `Cow<'a, str>`。
- **`SmallVec`／`ArrayVec`**: 「ほぼ常に小さい」コレクションをスタックに乗せる。
- **`compact_str`／`smartstring`**: 短い文字列のヒープ確保を回避。
- **`Box<[T]>` over `Vec<T>`**: 伸長しない場合は容量を持つ必要がない。
- **`.clone()` の駆除**: visitor を `&` で受ける。`Rc<T>`／`Arc<T>` で共有。
- **書き込みバッファの事前確保**: `String::with_capacity(estimate)` で再アロックを防ぐ。
- **`format!()` を `write!()` に**: ホットパスでは `format!` が temporary を作るので避ける。

```rust
// Before
let s = format!("{}-{}", a, b);
out.push_str(&s);

// After
use std::fmt::Write;
write!(out, "{}-{}", a, b).unwrap();
```

### C. メモリレイアウト（典型 1.1〜1.5x、塵も積もる）

- **Enum サイズを切る**: `size_of::<Expression>()` を assert で固定。大きいバリアントは `Box` 化。
  ```rust
  #[test]
  fn ast_size_is_bounded() { assert_eq!(std::mem::size_of::<Expr>(), 16); }
  ```
- **`u32` over `usize`**: ソース位置・ID などは 32bit で十分。半分のサイズで cache 効率倍。
- **構造体のフィールド順**: padding を減らす。`#[repr(C)]` で確認、`cargo-show-asm` で layout 見る。
- **インライン化**: 短い String、固定長 ID は `[u8; N]` に inline。TLB ミスが減る。
- **ホットフィールドの分離**: 巨大構造体のうちホットに触る部分だけ別配列に（SoA 化）。

### D. ハッシュ（典型 1.2〜2x、ホットなマップで顕著）

- 標準 `HashMap` は **SipHash（暗号強度）** で遅い。非暗号用途は `FxHashMap`（`rustc-hash`）または `ahash`。
- キーが小さく数が少ない場合は **線形探索 (`Vec<(K,V)>`) のほうが速い** こともある。要計測。
- 完全ハッシュ（キーワードテーブル等）は `phf` クレートでビルド時生成。

### E. ホットループのミクロ最適化（典型 1.05〜1.3x）

プロファイルで本当にホットな関数だけに適用。**読みやすさを犠牲にする価値があるか毎回問う。**

- `#[inline]` を small で hot な関数に。デカい関数に付けると逆効果。
- `#[cold]` をエラーパス・初期化に。命令キャッシュを汚さない。
- **branchless**: 分岐予測ミスが上位に来ていたら算術で書き換える。
  ```rust
  // 例：マイナス符号判定（記事 1BRC より）
  let neg = (b == b'-') as i16;
  let val = (val ^ -neg) + neg;  // neg なら -val、そうでなければ val
  ```
- **SIMD**: `memchr`（区切り文字検索）、`std::simd`（nightly）、`wide` クレート（stable）。
- **UTF-8 検証の省略**: 既に検証済みなら `from_utf8_unchecked`（unsafe、要根拠コメント）。
- **ループアンロール**: 通常 LLVM がやる。手動アンロールは asm 確認後のみ。

### F. ビルド設定（リターン中、コスト極小）

`Cargo.toml`:

```toml
[profile.release]
lto = "thin"          # まず thin。+10〜20%。fat は更に効くがビルド倍長
codegen-units = 1     # 単一ユニットで LLVM 最適化を最大化
panic = "abort"       # unwind テーブル不要、サイズ小・若干速い
debug = "line-tables-only"
```

CPU 固有命令（配布バイナリ以外）:

```bash
RUSTFLAGS="-C target-cpu=native" cargo build --release
```

アロケータ差し替え（malloc が profile 上位なら効く）:

```rust
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;
// あるいは tikv_jemallocator::Jemalloc
```

リンカ (`mold`/`lld`) はビルド時間短縮であり実行速度には効かない。ただしループの回転速度が上がる＝間接的に効く。

最後の数 % が欲しいなら **PGO (Profile-Guided Optimization)** と **BOLT**。`cargo-pgo` で自動化、典型 +5〜15%。

### G. 並列化（シングルスレッドを絞ってから）

- 1 スレッドのプロファイルで「もう絞れない」と判断してから `rayon` 等を入れる。
- 並列化は **アロケータ競合**・**false sharing**・**ロック争奪** を生むため、シングルスレッド最適化を済ませる前にやると測定がぐちゃぐちゃになる。
- グローバル `Mutex` は並列化を殺す（OXC が `string-cache` を削除して +30% 出した教訓）。スレッドローカル → 最後にマージ、を基本に。

## 5. アンチパターン（過去のハマりどころ）

- **LLVM が既にやっていることを手でやる**: 数日かけて 1% — 引き合わない。`cargo asm` で確認してから。
- **マイクロベンチで勝ってマクロで負ける**: criterion で +20% でも、ホットでなければ全体は無変化。エンドツーエンドも必ず測る。
- **キャッシュやワークアラウンドで複雑性を盛る**: 根本のデータ構造を直すほうが速いし読みやすい。
- **ノイズを改善と誤認**: ±5% は計測ノイズ。`hyperfine` の信頼区間で有意差を確認。
- **「速くなったはず」のコミット**: 数値なしで残さない。後で誰も判断できない。
- **コールド領域の最適化**: 起動時 1 回しか走らないコードを 10x しても誰も気付かない。
- **ベンチが本番と乖離**: 小さい入力・人工データでは現実のボトルネックが出ない。
- **回帰テスト省略**: 速くて壊れているコードはバグ。`cargo test --release` を毎周。

## 6. 止めどき

以下のいずれかに該当したら、そのループは閉じて別ホットスポットへ移る:

- プロファイル上位 5 関数を全て触ったが、目標数値の 80% 以上を達成
- 残るホット関数が `<5%` の比重しかない（伸びしろが少ない）
- 次の改善案が「コードを著しく読みにくくする」かつ期待 < 5%
- ループを 3 周回しても 1% も動かない（仮説の質を疑う、別フェーズへ）

## 7. rsvelte 固有のクイックリファレンス

このリポジトリで本スキルを使う場合の即実行コマンド:

```bash
# ベースライン（必須）
./scripts/bench.sh --quick      # JS vs Rust 単線比較
./scripts/bench.sh --profile    # parse / analyze / transform 内訳
./scripts/bench.sh --criterion  # 統計的マイクロベンチ

# プロファイル（samply 推奨）
cargo build --profile profiling --bin profiler
samply record ./target/profiling/profiler --file path/to/large.svelte --iterations 100
# macOS なら Instruments も可
instruments -t "Time Profiler" ./target/profiling/profiler -- --file path/to/large.svelte --iterations 100

# 仮説の素探し（既知の重い箇所）
rg "serde_json::Value" src/ --type rust -l
rg "\.clone\(\)" src/compiler/ --type rust -c
rg "format!\(" src/compiler/ --type rust -c
rg "Box::new" src/ --type rust -c

# 回帰確認（速さより正しさ）
cargo test --release

# NAPI 経由のエンドツーエンド確認
cargo build --release --features napi --lib
cp target/release/libsvelte_compiler_rust.dylib svelte/rsvelte.darwin-arm64.node
```

rsvelte 固有の大きな伸びしろ（既存 `perf` スキル参照）:
- `serde_json::Value` の駆逐 → typed AST（5〜20x 余地）
- `bumpalo` アリーナ導入（2〜5x）
- `Atom<'a>` での文字列インターン（1.5〜3x）
- codegen の直接書き出し化（2〜5x）

## 8. ワークフロー（`$ARGUMENTS` 指定時の挙動）

ユーザーが `/perf-loop $ARGUMENTS` を呼んだら:

1. `$ARGUMENTS` が `continue` → 直近の perf log を読み、次のループを開始
2. `$ARGUMENTS` が関数名・モジュール名 → そこに焦点を絞ってループ
3. `$ARGUMENTS` が空 → 全体を `--profile` で計測し、上位 5 ホットスポットを提示
4. **必ず順序を守る**: baseline → profile → 仮説提示（ユーザー確認）→ 変更 → test → 再計測 → keep/revert 判定
5. 各イテレーション後に **数値と判定をユーザーに報告**。1 イテレーション 1 メッセージを目安に
6. 3 周ごとに、達成した数値と次の候補ホットスポットを要約する

## 9. References

- The Rust Performance Book — https://nnethercote.github.io/perf-book/
  - とくに `profiling.html`, `general-tips.html`, `build-configuration.html`, `benchmarking.html`
- OXC Performance Notes — https://oxc.rs/docs/learn/performance
  - enum サイズ削減、bumpalo、string-cache の罠、string インライン化など実例多数
- 「1BRC を Rust で解いた話」（モドク × ユウスクタン）— https://findy-code.io/media/articles/modoku-yusuktan-202605
  - 90s → 1.08s の段階的最適化記録。mmap + madvise、`memchr`、独自ハッシュ、branchless 化、`std::simd` の実戦例
- `samply`: https://github.com/mstange/samply
- `cargo-flamegraph`: https://github.com/flamegraph-rs/flamegraph
- `criterion`: https://bheisler.github.io/criterion.rs/book/
- `hyperfine`: https://github.com/sharkdp/hyperfine
- `dhat-rs`: https://docs.rs/dhat
- `cargo-pgo`: https://github.com/Kobzol/cargo-pgo
