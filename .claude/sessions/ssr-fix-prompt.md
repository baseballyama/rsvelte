# タスク: rsvelte SSR セマンティック互換性を 769/910 → 910/910 に改善

## 現状

- **Client JS**: 910/910 (100.0%) — canon 一致。完了済み
- **SSR**: 769/910 (84.5%) — **141 件のセマンティック差異**
- 全 3068 件の cargo テストはパス、リグレッションゼロ
- 最後のコミット: `50d81e4 fix: SSR panic in extract_constant_vars`

## 環境

- 作業ディレクトリ: /Users/baseballyama/git/rsvelte_core
- Docker コンテナ: rsvelte_core-dev で cargo コマンドを実行
- NAPI バインディング: svelte/rsvelte.linux-arm64-gnu.node

## ビルドと測定コマンド

```bash
# ビルド + NAPI コピー
docker exec rsvelte_core-dev bash -c 'cd /workspace && cargo build --release --features napi --lib 2>&1 | tail -3 && cp target/release/librsvelte_core.so svelte/rsvelte.linux-arm64-gnu.node'

# SSR 測定
docker exec rsvelte_core-dev bash -c 'cd /workspace && LD_PRELOAD=/workspace/svelte/rsvelte.linux-arm64-gnu.node node scripts/bench/measure-ssr.mjs 2>&1'

# Client 測定（リグレッション確認用）
docker exec rsvelte_core-dev bash -c 'cd /workspace && LD_PRELOAD=/workspace/svelte/rsvelte.linux-arm64-gnu.node node scripts/diff/precise-semantic-diff.mjs 2>&1 | head -10'

# SSR カテゴリ分類
docker exec rsvelte_core-dev bash -c 'cd /workspace && LD_PRELOAD=/workspace/svelte/rsvelte.linux-arm64-gnu.node node scripts/diff/categorize-ssr-diffs.mjs 2>&1'

# 1ファイルのSSR差分確認
docker exec rsvelte_core-dev bash -c 'cd /workspace && LD_PRELOAD=/workspace/svelte/rsvelte.linux-arm64-gnu.node node scripts/diff/ssr-diff-one.mjs <FILE_PATH> 2>&1'
# → /tmp/ssr_js.js と /tmp/ssr_rs.js に書き出される

# テスト
docker exec rsvelte_core-dev cargo test --release --no-fail-fast 2>&1 | grep FAILED
```

## SSR 141 件の差異カテゴリ

| カテゴリ | 件数 | 説明 |
|----------|------|------|
| renderer output | 60 | `$$renderer.push()` 内のインデント差異、テンプレート生成順序 |
| unknown (indentation) | 32 | スクリプト本体のインデント/空白差異 |
| import formatting | 29 | import 文のフォーマット差異（スペース vs タブ、改行位置） |
| trailing comma | 19 | import の末尾カンマ差異 |
| attribute handling | 1 | 属性フォーマット差異 |

## 具体的なバグパターン（優先度順）

### 1. store subscription 未展開（7 ファイル — セマンティックバグ）
```
JS: $.store_get($$store_subs ??= {}, '$boundingBoxesArray', boundingBoxesArray).some(...)
RS: $boundingBoxesArray.some(...)
```
SSR でストア変数 `$xxx` が `$.store_get($$store_subs, ...)` に展開されていない。
- 調査箇所: `src/compiler/phases/3_transform/server/transform_script.rs`
- 該当ファイル:
  - `immich/.../video-native-viewer.svelte`
  - `immich/.../right-click-context-menu.svelte`
  - `immich/.../gallery-viewer.svelte`
  - `immich/.../navigation-loading-bar.svelte`
  - `immich/.../+page.svelte`
  - `gradio/.../Demos.svelte`
  - `gradio/.../+page.svelte`

### 2. store_mutate の代入切断（1 ファイル — 構文エラー）
```
RS: $.store_mutate($$store_subs ??= {}, '$albumViewSettings', albumViewSettings,
      $.store_get($$store_subs ??= {}, '$albumViewSettings', albumViewSettings).filter = )
    Object.keys(albumFilterNames)...
```
多行の代入式が `= )` で切断される。
- 調査箇所: `src/compiler/phases/3_transform/server/transform_script.rs` のストア代入処理
- 該当ファイル: `immich/.../albums-controls.svelte`

### 3. import フォーマット差異（~48 ファイル）
```
JS: import {\n\tAlbumFilter,\n\tSortOrder\n} from '...';
RS: import {\n\n    AlbumFilter,\n    SortOrder,\n  }\n  from '...';
```
原因: `strip_typescript` が TypeScript の `type` インポート指定子を除去した後、
残ったインポートがソースの空白フォーマットを保持（スペースインデント、トレイリングカンマ）。
公式 Svelte コンパイラは esrap で再フォーマット（タブ、カンマなし）。

修正方針: SSR のインポート出力を OXC codegen で正規化するか、
テキストベースでタブ変換+トレイリングカンマ除去を行う。
- 調査箇所: `src/compiler/phases/3_transform/server/build.rs` lines 272-287
  および `src/compiler/phases/3_transform/server/helpers.rs` の `extract_imports`

### 4. スクリプト本体のインデント差異（~60 ファイル）
```
JS: \t\tconst flipOrdering = (ordering) => {
RS:     const flipOrdering = (ordering) => {
```
ソースが 2-space インデントの場合、SSR 出力もスペースのまま。
公式はタブに変換。

修正方針: SSR 出力のスクリプト部分を正規化（スペース→タブ変換）。
`build.rs` の `body_code` 生成後にインデント正規化を追加。

### 5. テンプレートリテラル内の空白差異（~30 ファイル）
`$$renderer.push(...)` 内のバッククォート文字列の改行・インデントが異なる。
公式は esrap でフォーマットするが、RS はテキストベースの組み立て。

## 修正戦略

### Phase 1: セマンティックバグの修正（最優先）
1. store subscription 未展開 → `transform_script.rs` のストア変換ロジック修正
2. store_mutate 代入切断 → 多行式の結合ロジック修正

### Phase 2: フォーマット正規化
3. SSR 出力全体に OXC parse→codegen 正規化パスを追加
   - `src/compiler/phases/3_transform/server/mod.rs` の `transform_server` 関数末尾
   - Client で使っている `normalize_js_with_oxc` を SSR にも適用
   - ただし OXC はスペースインデントなので、タブへの変換が追加で必要

### Phase 3: Canonicalizer 改善（代替案）
4. OXC canonicalizer にトレイリングカンマ正規化を追加
5. インデントスタイルの正規化

## 重要な注意事項

- Client の 910/910 を壊さないこと。各変更後に `precise-semantic-diff.mjs` を実行
- SSR パニック修正済み（`helpers.rs:1409` のスライスエラー）
- `docker-dev.sh` ではなく直接 `docker exec rsvelte_core-dev ...` を使う
- Docker コンテナは `aarch64` (ARM64)
- コミットは頻繁に、各論理的な修正ごとに commit + push
- `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings` をコミット前に

## 参考ファイル

- SSR 測定スクリプト: `scripts/bench/measure-ssr.mjs`
- SSR カテゴリ分類: `scripts/diff/categorize-ssr-diffs.mjs`
- SSR 1ファイル差分: `scripts/diff/ssr-diff-one.mjs`
- Client 測定: `scripts/diff/precise-semantic-diff.mjs`
- SSR コード生成: `src/compiler/phases/3_transform/server/`
- SSR ビルド: `src/compiler/phases/3_transform/server/build.rs`
- SSR スクリプト変換: `src/compiler/phases/3_transform/server/transform_script.rs`
- SSR ヘルパー: `src/compiler/phases/3_transform/server/helpers.rs`
- 公式 SSR 変換: `svelte/packages/svelte/src/compiler/phases/3-transform/server/`
