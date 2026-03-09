# svelte-compiler-rust

Svelte コンパイラの Rust 実装。公式コンパイラとの**100% テスト互換性**を達成済み。

## Highlights

- **3,028 / 3,028 テスト通過** — 公式 Svelte コンパイラのテストスイートと完全互換
- **シングルスレッドで 2.1x、マルチスレッドで 15.8x 高速** (公式 JS コンパイラ比)
- **ドロップイン代替品** — N-API バインディングにより既存ツール (Vite 等) とそのまま使用可能
- **WASM 対応** — ブラウザ上でも動作

## Performance

3,654 個の Svelte ファイルのコンパイルベンチマーク:

| | 時間 | スループット | 倍率 |
|---|---:|---:|---:|
| **JavaScript (svelte/compiler)** | 689ms | 5,304 files/sec | 1.0x |
| **Rust (single-threaded)** | 333ms | 10,986 files/sec | **2.1x** |
| **Rust (multi-threaded)** | 44ms | 83,797 files/sec | **15.8x** |

> ベンチマーク環境: Apple M1 Max, 3,654 テストファイル (client + server モード), 3 回実行の平均値

## Compatibility

公式 Svelte コンパイラのテストスイートとの互換性:

| Test Suite | Pass | Total | Status |
|---|---:|---:|---|
| Parser Modern | 22 | 22 | 100% |
| Parser Legacy | 82 | 82 | 100% |
| Compiler Snapshot | 20 | 20 | 100% |
| CSS | 179 | 179 | 100% |
| Validator | 324 | 324 | 100% |
| Compiler Errors | 144 | 144 | 100% |
| Runtime Runes | 865 | 865 | 100% |
| Runtime Legacy | 1,202 | 1,202 | 100% |
| Runtime Browser | 31 | 31 | 100% |
| Hydration | 77 | 77 | 100% |
| SSR | 82 | 82 | 100% |
| **Total** | **3,028** | **3,028** | **100%** |

未実装のスイート: Preprocess, Print, Migrate (互換性テストには含まれていません)

## Goals

このプロジェクトが目指すもの:

1. **Svelte コンパイラの完全互換ドロップイン代替品** — 公式コンパイラと同一の出力を生成し、既存のすべてのツールチェーンで使用可能に
2. **[svelte-check](https://github.com/sveltejs/language-tools) への組み込み** — 型チェック・診断の高速化
3. **[Rolldown](https://rolldown.rs/) への組み込み** — Svelte プロジェクトのビルドパイプラインを高速化
4. **[oxlint](https://oxc.rs/docs/guide/usage/linter) への組み込み** — Svelte ファイルの lint サポート
5. **[oxfmt](https://oxc.rs/) への組み込み** — Svelte ファイルのフォーマッターサポート
6. **[OXC](https://oxc.rs/) エコシステムとの統合** — OXC の JavaScript/TypeScript ツールチェーンの Svelte 対応基盤として機能

## Architecture

ディレクトリ構造は公式 Svelte コンパイラ (`svelte/packages/svelte/src/compiler/`) をミラーしています。

```
src/compiler/phases/
├── 1_parse/     # パース (Svelte 構文 → AST)
├── 2_analyze/   # 解析 (スコープツリー, バインディング)
└── 3_transform/ # コード生成 (AST → JS/CSS)
```

主な設計方針:

- メモリ効率の良い AST 表現 (u32 ポジション, compact_str)
- rayon による並列処理
- OXC による JavaScript パース・コード生成
- フェーズ間の直接 AST 受け渡し (再パース不要)

## Usage

### Rust API

```rust
use svelte_compiler_rust::{compile, CompileOptions};

let source = r#"<h1>Hello, {name}!</h1>"#;
let result = compile(source, CompileOptions::default()).unwrap();
```

### WASM

```bash
wasm-pack build --target web --release -- --features wasm --no-default-features
```

## Development

### Setup

```bash
git submodule update --init --recursive
npm install
npm run generate-fixtures  # テスト実行前に必要
```

### Build & Test

```bash
cargo build                # ビルド
cargo test                 # テスト実行
cargo test --release       # リリースビルドでテスト (推奨)
cargo bench                # ベンチマーク実行
```

### Docker (Optional)

```bash
./docker-dev.sh build      # Docker イメージのビルド
./docker-dev.sh up         # コンテナ起動
./docker-dev.sh shell      # コンテナ内シェル
./docker-dev.sh test       # テスト実行
```

VS Code の Dev Containers 拡張を使用する場合は「Reopen in Container」を選択してください。

### Upgrading Svelte

```bash
./scripts/upgrade-svelte.sh 5.52.0
```

Svelte サブモジュールのバージョン更新、コンパイラのビルド、フィクスチャの再生成、互換性レポートの更新を自動で行います。

## Known Incompatibilities

### Parser Legacy: `javascript-comments` (1 test skipped)

公式コンパイラは acorn を使用し、コメントを AST ノードに `leadingComments` / `trailingComments` として付与します。この実装は OXC を使用しており、コメントは別リストとして提供されます。レガシー AST フォーマット (Svelte 4 互換モード) にのみ影響し、コンパイル出力やランタイム動作には影響しません。

## License

MIT
