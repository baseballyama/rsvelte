# rsvelte VSCode 拡張 + Language Server 実装計画

rsvelte のツールチェイン（format / lint / type-check）をエディタに統合する VSCode
拡張と Language Server を作る。本書は次セッションでゼロから実装するための設計・手順書。

## ゴール（合意済みの方針）

- **アーキテクチャ: LSP から作る**（`rsvelte-language-server` + 薄い VSCode クライアント）。
  将来 neovim 等でも再利用できる。
- **v1 スコープ: format + lint**。型チェックは後追い（理由は後述）。
- **配布: VS Code Marketplace に publish**（+ Open VSX 推奨）。

## 前提となる事実（このセッションで実機確認済み・2026-06-25）

### 使えるツール

| 機能 | 実体 | 状態 |
| ---- | ---- | ---- |
| format | `rsvelte-fmt`（`@rsvelte/fmt` 0.3.20 npm 公開済） | ✅ `--stdin --stdin-filepath <path>` で stdin 整形→stdout。native 起動 ~0ms |
| lint | `rsvelte-lint`（リポ bin。**npm 未公開**）＋ **wasm ビルドあり** | ⚠️ 配布要。下記参照 |
| type-check | `@rsvelte/svelte-check`（npm 公開済） | v1 対象外 |

### format は「workspace の native rsvelte-fmt を spawn」する

- `rsvelte-fmt --stdin --stdin-filepath ${fileName}` に本文を流し、stdout を受け取る。
- **wasm fmt（`rsvelte_fmt_wasm`）は使わない**: wasm はサブプロセスを起動できず、CSS/MD/
  inline `<style>` の oxfmt 委譲ができないため整形が不完全になる。native CLI は oxfmt を
  内部委譲して完全整形する。
- 解決: `node_modules/.bin/rsvelte-fmt`（consumer が `@rsvelte/fmt` を導入済みなら hoist 済）
  を優先。無ければ formatting を無効化（エラーにしない）。

### lint は「rsvelte_lint の wasm を拡張に同梱」する（npm 公開不要）

- `rsvelte-lint` は npm 未公開。marketplace 拡張から使うには配布手段が要る。
  **wasm 同梱が最善**（自己完結・クロスプラットフォーム・publish 不要。lint は oxfmt 委譲が
  無いので wasm で完全動作する）。
- wasm API（`crates/rsvelte_lint/src/wasm.rs`）:
  ```rust
  #[wasm_bindgen] pub fn lint(source: &str, filename: &str) -> String  // JSON 文字列
  #[wasm_bindgen] pub fn lint_version() -> String
  ```
- `lint()` の戻り値は **Entry の JSON 配列**:
  ```jsonc
  // [{ "severity": "error"|"warn"|..., "line": 1, "column": 0,
  //    "end_line": 1, "end_column": 5, "code": "...", "message": "..." }]
  ```
  `line` は 1-indexed、`column` は 0-indexed（svelte コンパイラ由来）。
  → LSP Diagnostic への変換: `range.start = { line: line-1, character: column }`,
    `range.end = { line: end_line-1, character: end_column }`。severity を LSP の
    Error/Warning/Information にマップ。`code`/`message` をそのまま。
- wasm ビルド: 既存 `build:wasm:core` は
  `wasm-pack build crates/rsvelte_lint --out-dir ../../pkg --target web ... --features wasm`。
  **LSP（Node）用には `--target nodejs`（または `bundler`）でビルドし直す**こと（`web` は
  Node で読みにくい）。拡張に同梱する。
- 代替（採らない）: `@rsvelte/lint` を native bin で npm 公開し `rsvelte-lint --format sarif`
  を spawn。SARIF（`crates/rsvelte_lint/src/output.rs` の `write_sarif`、startLine 1-idx /
  startColumn = 0-idx+1）を解析。CLI 再利用が要るなら将来検討。**`--format json` は無い**
  （有効値は `sarif` など。`LintFormat::parse`）。

### 型チェックを v1 から外す理由

- `@rsvelte/svelte-check` は**プロジェクト一括のバッチ型チェッカー**（`--watch` はファイル
  監視の一括再実行）。本家 Svelte 拡張の tsserver による**増分リアルタイム診断**とは別物。
- LSP でラップしても rsvelte-check 自体がバッチなので**増分にはならない**（保存毎に全体型
  チェック＝重い）。v1 では入れず、後追いで「保存時バッチ / オンデマンドコマンド」を検討。

## 実装手順

### 1. `apps/npm/language-server`（`@rsvelte/language-server`）

- Node + `vscode-languageserver` / `vscode-languageserver-textdocument`。
- `onInitialize`: `documentFormattingProvider: true`、diagnostics（push 方式）。
- `onDocumentFormatting`:
  - 対象拡張（svelte/ts/tsx/js/jsx/mjs/cjs/json/jsonc/css/scss/less）。
  - workspace の `rsvelte-fmt` を `--stdin --stdin-filepath <doc.uri のパス>` で spawn、
    本文を stdin、stdout を全文 `TextEdit`（ドキュメント全置換）で返す。
  - rsvelte-fmt が見つからない / 失敗時は空編集（エラーにしない）。
  - oxfmt 解決のため `RSVELTE_FMT_NODE` 等は native-direct の sidecar が処理（基本は環境変数
    不要。`@rsvelte/fmt` postinstall 済前提）。
- diagnostics（`documents.onDidOpen` / `onDidChangeContent`〔300ms デバウンス〕/ `onDidSave`）:
  - 同梱 lint wasm の `lint(text, fsPath)` を呼ぶ → `JSON.parse` → LSP Diagnostic 配列 →
    `connection.sendDiagnostics`。
  - lint 対象は svelte/ts/js 系。
- 設定: `rsvelte.format.enable`(既定 true) / `rsvelte.lint.enable`(既定 true) /
  `rsvelte.rsvelteFmtPath`(任意の rsvelte-fmt パス上書き)。
- esbuild で `dist/server.js` に bundle（lint wasm も同梱）。

### 2. `apps/npm/vscode`（拡張 `rsvelte-vscode`）

- `vscode-languageclient` で上記 server を `node dist/server.js`（`--stdio`）として起動。
- `package.json` マニフェスト:
  - `activationEvents`: `onLanguage:svelte` ほか対象言語。
  - `contributes.languages`（svelte の言語定義が無ければ最小限）。
  - `contributes.configuration`: 上記設定キー。
  - formatter として登録（`languages.registerDocumentFormattingEditProvider` は server 側 LSP
    capability で OK。VSCode 側で `editor.defaultFormatter` を rsvelte に向ける案内を README に）。
  - `publisher` / `name` / `displayName` / `icon` / `repository`。
- esbuild で `dist/extension.js` に bundle。`icon.png` / `README.md` / `LICENSE` / `CHANGELOG`。

### 3. ビルド配線

- ルート `package.json` に `build:wasm:lint-node`（`--target nodejs` で rsvelte_lint を
  language-server の `vendor/` に出力）等を追加。
- language-server / 拡張の bundle スクリプト（esbuild）。
- catalog / pnpm-workspace に新パッケージを登録。

### 4. publish（marketplace）

- VS Code Marketplace の **publisher 登録**（ユーザー作業）と **`VSCE_PAT`** secret。
- `@vscode/vsce package` / `vsce publish`。Open VSX は `ovsx publish` + `OVSX_PAT`。
- `release.yml` に拡張 publish ジョブを追加（または手動 publish から開始）。
- changeset（rsvelte の versioning 規約に乗せる）。

### 5. テスト

- **headless で可能**: server の stdin LSP スモークテスト（initialize → formatting →
  ドキュメント全置換が rsvelte-fmt と一致 / didOpen → diagnostics が lint wasm と一致）。
  lint 変換（line/column→LSP range、severity マップ）のユニットテスト。
- **実機（ユーザー作業）**: `F5`（Extension Development Host）で format-on-save・lint 波線を
  目視確認。

## rsvelte 作業の作法（既存規約）

- changeset（該当パッケージ patch/minor）。cargo test/clippy/fmt（wasm 変更があれば）。
- CI の Formatter parity / corpus は wasm/lint に影響しない範囲なら緑のはず。要確認。
- squash マージ → Version Packages PR マージで release。git add は対象ファイル個別指定。
- oxc rev は触らない（lint wasm は既存 rev のまま）。

## 残課題・ユーザー判断が要る点

- Marketplace publisher アカウント + `VSCE_PAT`（+ Open VSX `OVSX_PAT`）。
- 拡張の `publisher`/`name`/`displayName`/アイコン。
- format-on-save の対象言語で、本家 Svelte 拡張（svelte 言語）と formatter が競合しないかの
  整理（`editor.defaultFormatter` の案内）。
- 型チェック（rsvelte-check）の後追い方式（保存時バッチ / オンデマンド）。
- lint: wasm 同梱（推奨・本書の前提）で進めるか、`@rsvelte/lint` npm 公開に切り替えるか。
