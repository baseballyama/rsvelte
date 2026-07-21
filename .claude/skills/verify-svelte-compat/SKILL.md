---
name: verify-svelte-compat
description: Svelte を使う外部リポジトリ（ツール / ライブラリ / アプリ）を git submodule として取り込み、Svelte コンパイラを rsvelte に差し替えても完全に同等に動作するかを検証する。既存のサブモジュールが指定された場合は最新化したうえで再検証し、回帰があれば rsvelte 側を自動修正する。「/verify-svelte-compat <url-or-name>」で実行。
argument-hint: "<github-url | existing-submodule-name>"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Skill, WebSearch, WebFetch
effort: max
---

# Verify Svelte Compatibility — 外部 Svelte リポジトリでの rsvelte 互換性検証

rsvelte が公式 Svelte コンパイラと **同じ出力・同じ挙動** を生成するかを、実際の Svelte エコシステムのリポジトリで検証するスキル。

このスキルは 3 つのことをやる:

1. **新規リポジトリの取り込み** — GitHub URL を受け取り、`compatibility/verify-svelte-compat/<name>/` 配下に git submodule として追加し、互換性を検証する
2. **既存サブモジュールの更新検証** — `vite-plugin-svelte` や `language-tools` のような既存サブモジュールを最新化したうえで、互換性が保たれているか再検証する
3. **回帰の自動修正** — 検証中に検出された rsvelte 側のバグを、修正再検証ループで解消する

> **重要**: 修正は **rsvelte 側のみ**。ターゲットリポジトリは「公式 Svelte 互換性のリファレンス」として扱い、原則として変更しない。

## 前提

- rsvelte リポジトリ内で実行する
- `cargo`, `pnpm`, `node` (>=22), `git` が使える
- `svelte/` サブモジュールが初期化されている（公式コンパイラのリファレンス）

## 用語

| 語 | 意味 |
|---|---|
| **ターゲット** | 検証対象の外部 Svelte リポジトリ |
| **ツール型** | Svelte コンパイラを内部で呼び出すツール / ライブラリ（vite-plugin-svelte, language-tools 等）。**自前のテストスイートを持つ** |
| **アプリ型** | エンドユーザー向けアプリ（immich, gradio, SvelteKit ベースの自社プロダクト等）。**.svelte ファイルが多数ある** |
| **swap** | ターゲット内部で読まれる `svelte/compiler` を、rsvelte の NAPI バインディングに置き換える操作 |

## 引数の解釈

`/verify-svelte-compat <arg>` の `<arg>` を以下のルールで解釈する:

1. **`<arg>` が URL（`http(s)://` または `git@`）** → **Mode A**（新規追加）
2. **`<arg>` が既存サブモジュールのパスまたは名前**（`.gitmodules` で確認）→ **Mode B**（更新検証）
3. **空** → ユーザーに確認

```bash
# 引数の検証ロジック
if [[ "$ARG" =~ ^(https?://|git@) ]]; then
  MODE="add"
elif git config --file .gitmodules --get-regexp '\.path$' | awk '{print $2}' | grep -Fxq "$ARG"; then
  MODE="update"
elif git config --file .gitmodules --get-regexp '\.path$' | awk '{print $2}' | grep -F "/$ARG\$"; then
  MODE="update"  # ベース名一致
else
  # ユーザーに確認
fi
```

## ディレクトリ規約

```
compatibility/verify-svelte-compat/                       # このスキルが管理するサブモジュール置き場
  <name>/                             # 各ターゲット（git submodule）
    .compat-meta.json                 # 検証メタ情報（型 / バージョン / 最終結果）— gitignored
  .cache/                             # 一時データ（baseline 出力など）— gitignored
.gitmodules                           # 追加した submodule はここに記録
```

既存の `vite-plugin-svelte/`、`language-tools/` は **ルート直下のレガシー配置**。このスキルでも Mode B から扱えるが、新規追加は **必ず `compatibility/verify-svelte-compat/<name>/`** に配置する。

`compatibility/verify-svelte-compat/` 自体は git に追加するが、`compatibility/verify-svelte-compat/.cache/` および `compatibility/verify-svelte-compat/*/.compat-meta.json` は `.gitignore` 対象。

---

## 全体ワークフロー

```
Phase 0: 引数解釈                  → Mode A (add) か Mode B (update) を決定
Phase 1: ターゲット取得             → submodule 追加 or 更新
Phase 2: ターゲット分析             → ツール型 / アプリ型を判定、ビルドシステム特定
Phase 3: rsvelte NAPI ビルド        → ターゲットから読める形に配置
Phase 4: 互換性検証                 → ツール型: 自前テスト実行 / アプリ型: 全 .svelte 比較
Phase 5: 失敗分析と自動修正         → rsvelte 側の根本原因を特定して修正
Phase 6: 再検証ループ               → Phase 4 → Phase 5 を指摘ゼロまで反復
Phase 7: メタ情報保存とコミット     → .compat-meta.json 更新、コミット
```

---

## Phase 0: 引数解釈と Mode 決定

```bash
ARG="${1:-}"

# .gitmodules を読み込み
SUBMODULES=$(git config --file .gitmodules --get-regexp '\.path$' | awk '{print $2}')

if [ -z "$ARG" ]; then
  echo "URL またはサブモジュール名を指定してください" >&2
  echo "登録済みサブモジュール:" >&2
  echo "$SUBMODULES" | sed 's/^/  - /' >&2
  exit 64
elif [[ "$ARG" =~ ^(https?://|git@) ]]; then
  MODE="add"
  URL="$ARG"
elif echo "$SUBMODULES" | grep -Fxq "$ARG"; then
  MODE="update"
  TARGET_PATH="$ARG"
elif MATCH=$(echo "$SUBMODULES" | awk -v n="$ARG" -F/ '$NF == n {print; exit}') && [ -n "$MATCH" ]; then
  MODE="update"
  TARGET_PATH="$MATCH"
else
  # ユーザーに確認
  echo "「$ARG」は登録済みサブモジュール名でも URL でもありません。" >&2
  exit 64
fi

# 報告
echo "Mode: $MODE"
echo "Target: ${TARGET_PATH:-(new) $URL}"
```

ユーザーへの最初の報告:

```
## Phase 0: 引数解釈
- Mode: [add / update]
- Target: [URL or submodule path]
- ターゲット名（推定）: <name>
```

`<name>` の推定:
- Mode A: URL の最後のセグメントから `.git` を除去（例: `https://github.com/sveltejs/kit.git` → `kit`）
- Mode B: パスの basename（例: `compatibility/verify-svelte-compat/kit` → `kit`、`vite-plugin-svelte` → `vite-plugin-svelte`）

---

## Phase 1: ターゲット取得

### Mode A: 新規 submodule 追加

```bash
NAME=$(basename "$URL" .git)
TARGET_PATH="compatibility/verify-svelte-compat/$NAME"

if [ -e "$TARGET_PATH" ]; then
  echo "Error: $TARGET_PATH が既に存在します" >&2
  exit 1
fi

mkdir -p compatibility/verify-svelte-compat
git submodule add "$URL" "$TARGET_PATH"
git submodule update --init "$TARGET_PATH"
```

submodule 追加後、安定タグへ checkout を試みる:

```bash
cd "$TARGET_PATH"
git fetch --tags --quiet || true
LATEST_TAG=$(git tag -l --sort=-version:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+$' | head -1 || true)
if [ -n "$LATEST_TAG" ]; then
  git checkout "$LATEST_TAG" --quiet
fi
COMMIT=$(git rev-parse --short HEAD)
cd -
```

### Mode B: 既存 submodule 更新

```bash
NAME=$(basename "$TARGET_PATH")

# 現状記録（ロールバック用）
cd "$TARGET_PATH"
PREV_COMMIT=$(git rev-parse HEAD)
cd -

# .gitmodules で branch 指定があるかチェック
BRANCH=$(git config --file .gitmodules --get "submodule.${TARGET_PATH}.branch" 2>/dev/null || true)

if [ -n "$BRANCH" ]; then
  # branch 指定があるなら remote の最新へ
  git submodule update --remote --merge "$TARGET_PATH"
else
  # branch 指定がないなら最新の安定タグへ
  cd "$TARGET_PATH"
  git fetch --tags --quiet
  LATEST_TAG=$(git tag -l --sort=-version:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+$' | head -1 || true)
  if [ -n "$LATEST_TAG" ]; then
    git checkout "$LATEST_TAG" --quiet
  else
    git fetch origin --quiet
    git checkout origin/HEAD --quiet 2>/dev/null || git pull --quiet
  fi
  cd -
fi

cd "$TARGET_PATH"
NEW_COMMIT=$(git rev-parse --short HEAD)
cd -

echo "Updated: $PREV_COMMIT → $NEW_COMMIT"
```

ユーザーへの報告:

```
## Phase 1: ターゲット取得
- パス: $TARGET_PATH
- コミット: <PREV> → <NEW>（または初回 <NEW>）
- バージョン: <tag があれば記載>
```

---

## Phase 2: ターゲット分析（ツール型 vs アプリ型）

ターゲットがどう Svelte コンパイラを使っているかを分析する。

### Step 2.1: 基本情報の収集

```bash
cd "$TARGET_PATH"

# package.json から情報を抽出
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('name:', pkg.name);
console.log('version:', pkg.version);
console.log('private:', pkg.private || false);
console.log('hasWorkspaces:', !!pkg.workspaces);
console.log('scripts:', Object.keys(pkg.scripts || {}).join(','));
console.log('depsKeys:', [
  ...Object.keys(pkg.dependencies||{}),
  ...Object.keys(pkg.devDependencies||{}),
  ...Object.keys(pkg.peerDependencies||{}),
].join(','));
"

# 各種ファイルの存在
for f in pnpm-workspace.yaml turbo.json nx.json lerna.json vite.config.ts vite.config.js svelte.config.js svelte.config.ts; do
  [ -f "$f" ] && echo "has:$f"
done

# .svelte ファイル数
SVELTE_FILES=$(find . -name '*.svelte' -not -path './node_modules/*' -not -path './.git/*' | wc -l)
echo "svelteFiles:$SVELTE_FILES"

cd -
```

### Step 2.2: タイプ判定

以下のルールで判定する:

| 兆候 | 判定 |
|------|------|
| **ソース** が `svelte/compiler` または `@rsvelte/compiler` を import している | **ツール型**（モノレポなら **モノレポ型**） |
| ワークスペース構成で複数パッケージを抱える | **モノレポ型** — 必要に応じて代表的なサブパッケージを 1 つ選んで以降を実行（ユーザー確認） |
| `.svelte` ファイル多数（>= 1）かつコンパイラ import なし | **アプリ型** |

> `alreadySwapped: true` が出た場合、そのリポジトリは既に rsvelte 用にフォーク済み（`@rsvelte/compiler` を import している）。Phase 4 では **swap ステップをスキップ** し、代わりに **Phase 4-A-0** で `@rsvelte/compiler` をローカル供給する。

判定スクリプト（`scripts/analyze-usage.mjs` を呼ぶ）:

```bash
node .claude/skills/verify-svelte-compat/scripts/analyze-usage.mjs "$TARGET_PATH"
```

このスクリプトは JSON を出力する:

```json
{
  "name": "vite-plugin-svelte",
  "type": "tool",            // "tool" | "app" | "monorepo"
  "svelteVersion": "^5.0.0",
  "buildSystem": "vite",     // "vite" | "webpack" | "rollup" | "kit" | "other"
  "compilerEntryPoints": [   // ターゲット内で svelte/compiler を import している箇所
    "packages/vite-plugin-svelte/src/utils/compile.js"
  ],
  "testCommands": [          // 検出したテストコマンド
    "pnpm test",
    "pnpm test:unit"
  ],
  "buildCommands": [
    "pnpm build"
  ],
  "svelteFileCount": 0,
  "monorepoPackages": []     // モノレポなら主要なサブパス
}
```

### Step 2.3: ユーザーへの確認（モノレポなど曖昧な場合のみ）

明確に tool / app と判定できた場合は確認なしで Phase 3 へ。
モノレポや判定不能の場合のみ:

```
## Phase 2: ターゲット分析（要確認）
- 名前: $NAME
- 検出タイプ: [tool / app / monorepo / unknown]
- ビルドシステム: [vite / webpack / kit / ...]
- Svelte バージョン: ^X.Y.Z
- .svelte ファイル数: N
- 検出したテストコマンド: [...]

→ 検証範囲を確認させてください:
   1. 全体（推奨ルート）
   2. サブパッケージを限定（モノレポの場合: <候補>）
   3. アプリ型として扱う / ツール型として扱う（判定が間違っている場合）
```

明確な場合の自動報告:

```
## Phase 2: ターゲット分析
- タイプ: tool / app
- ビルドシステム: ...
- Svelte バージョン: ...
- 検証戦略: [tool: 自前テストスイート実行 / app: .svelte 全件 semantic 比較]
```

---

## Phase 3: rsvelte NAPI と canonicalizer のビルド + 配置

```bash
# rsvelte NAPI バインディング + canonicalize_js を同時にビルド
.claude/skills/verify-svelte-compat/scripts/build-rsvelte.sh "$TARGET_PATH"
cargo build --release --bin canonicalize_js
```

`build-rsvelte.sh` の挙動:
- `cargo build --release -p rsvelte_napi --lib`
- プラットフォームに応じた `.node` ファイル名を計算
- `svelte/${NODE_NAME}` と `${TARGET_PATH}/.rsvelte/${NODE_NAME}` の両方にコピー

`canonicalize_js` は Phase 4-B での semantic 比較に必要。これがないと naive な whitespace canonicalizer に fallback し、formatting だけが違うケースを偽陽性で拾ってしまう（実測: vite-plugin-svelte で 25 件 → 9 件に減）。

> rsvelte の公開 API は `compile`、`compileModule`、`svelte2tsx` など `svelte/compiler` の主要 export と互換である（`src/napi.rs` 参照）。

---

## Phase 4: 互換性検証

タイプによって戦略を分岐する。

### 4-A: ツール型の検証

ツール型ターゲットは「自前のテストスイート」を持つ。これを **公式 Svelte で実行 → rsvelte で実行 → 結果を比較** する。

#### Step 4-A-0: rsvelte コンパイラの提供方法を決定

`alreadySwapped` の値で方針を決める:

- **`alreadySwapped: true`** （ターゲットが既に `@rsvelte/compiler` を import）
  → ローカル wrapper パッケージを生成し pnpm overrides で上書きする:
  ```bash
  node .claude/skills/verify-svelte-compat/scripts/provide-rsvelte-compiler.mjs \
    --target "$TARGET_PATH" \
    --rsvelte-binding "$(pwd)/${TARGET_PATH}/.rsvelte/${NODE_NAME}"
  ```
  これは `compatibility/verify-svelte-compat/.cache/rsvelte-compiler-pkg/` に最小 npm パッケージを作り、ターゲット `package.json` の `pnpm.overrides['@rsvelte/compiler']` を file: 参照に書き換える（**ベースラインのため public 版が要る場合は事前にコピー保存**）。

- **`alreadySwapped: false`** （ターゲットは公式 `svelte/compiler` のみ）
  → Step 4-A-2 の loader hook で実行時にすり替える。

#### Step 4-A-1: 依存関係インストール & ベースライン確立

```bash
cd "$TARGET_PATH"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install || npm install
INSTALL_EXIT=$?
cd -

# 公式 Svelte でテスト実行（baseline）
mkdir -p compatibility/verify-svelte-compat/.cache
BASELINE_LOG="compatibility/verify-svelte-compat/.cache/${NAME}-baseline.log"
if [ "$INSTALL_EXIT" -eq 0 ]; then
  ( cd "$TARGET_PATH" && pnpm test ) > "$BASELINE_LOG" 2>&1
  BASELINE_EXIT=$?
else
  BASELINE_EXIT=1
fi
```

**Install ブロック時のフォールバック**:

ターゲット側のフォーク不整合（例: `vite-plugin-svelte` の rsvelte ブランチで e2e-tests パッケージが `@sveltejs/vite-plugin-svelte` を `workspace:^` で参照したまま改名漏れになっている）など、ターゲット由来の install 失敗が起こり得る。

その場合の方針:
1. **`--filter` で問題パッケージを除外**して再試行（例: `pnpm install --filter '!@sveltejs/vite-plugin-svelte'`）
2. それでも失敗する場合は **Phase 4-A をスキップして Phase 4-B にフォールバック**。Phase 4-B は pnpm install を必要としない
3. ユーザーに「ターゲット側の問題で Phase 4-A は実行不能、Phase 4-B のみで検証する」と明示

ターゲット側の修正は **このスキルの責務外** — フォーク所有者にエスカレーションする。

#### Step 4-A-2: コンパイラ swap

ターゲット内部で `svelte/compiler` を import している箇所を、rsvelte の NAPI バインディングに置き換える。

最も低侵襲なのは **Node.js の loader / require フック** を使う方法:

```bash
# ターゲットの実行コマンドの先頭に NODE_OPTIONS で hook を仕込む
node .claude/skills/verify-svelte-compat/scripts/swap-compiler.mjs \
  --target "$TARGET_PATH" \
  --rsvelte-binding "$(pwd)/${TARGET_PATH}/.rsvelte/${NODE_NAME}"
```

`swap-compiler.mjs` の仕事:
1. ターゲット直下に `.rsvelte/loader.mjs` を生成（require フック）
2. ターゲットの `package.json` の `scripts.test` をラップして `NODE_OPTIONS="--import ./.rsvelte/loader.mjs"` を付与（一時的）
3. または、より確実な方法として `pnpm` のオーバーライドを使う:
   ```jsonc
   // package.json patch (一時的に書き戻す)
   "pnpm": {
     "overrides": {
       "svelte": "file:../<wrapper-pkg>"   // svelte/compiler を rsvelte に差し替えたラッパーパッケージ
     }
   }
   ```

> **既に `rsvelte` 用フォークになっている submodule**（`vite-plugin-svelte` の `rsvelte` ブランチ等）はこのステップをスキップ。`.rsvelte/.swap-applied` のような sentinel ファイルで判定する。

#### Step 4-A-3: rsvelte でテスト実行

```bash
RSVELTE_LOG="compatibility/verify-svelte-compat/.cache/${NAME}-rsvelte.log"
( cd "$TARGET_PATH" && pnpm test ) > "$RSVELTE_LOG" 2>&1
RSVELTE_EXIT=$?
```

#### Step 4-A-4: 結果比較

```bash
# 終了コード一致 + ログのテスト結果セクション一致
diff "$BASELINE_LOG" "$RSVELTE_LOG" > "compatibility/verify-svelte-compat/.cache/${NAME}-diff.log" || true
```

判定:
- baseline と rsvelte の両方がパス & ログの差分が無視可能（タイムスタンプなどのみ）→ **PASS**
- baseline がパスで rsvelte が失敗 → **REGRESSION**（rsvelte バグ候補 → Phase 5 へ）
- baseline 自体が失敗 → ターゲット側の問題（Phase 5 で修正対象外、ユーザーに報告）

### 4-B: アプリ型の検証

アプリ型は「全 `.svelte` ファイルを公式 / rsvelte の両方でコンパイルし、出力を semantic に比較」する。既存の `scripts/ecosystem/test-real-world-semantic.mjs` のロジックを応用する。

#### Step 4-B-1: 全 `.svelte` ファイル列挙

```bash
node .claude/skills/verify-svelte-compat/scripts/compare-app.mjs \
  --target "$TARGET_PATH" \
  --rsvelte-binding "$(pwd)/${TARGET_PATH}/.rsvelte/${NODE_NAME}" \
  --output "compatibility/verify-svelte-compat/.cache/${NAME}-app-report.json"
```

`compare-app.mjs` の仕事:
1. ターゲット配下の `.svelte` ファイルを列挙（`node_modules`、`.git`、ビルド出力ディレクトリは除外）
2. 各ファイルを `client` / `server` の両モードで両コンパイラに通す
3. 結果を JSON で出力:
   ```json
   {
     "totalFiles": 1234,
     "bothCompiled": 1230,
     "semanticEqual": 1225,
     "semanticDiff": 5,
     "rsvelteError": 4,
     "officialError": 0,
     "details": [
       { "file": "src/Foo.svelte", "category": "semantic-diff", "snippet": "..." }
     ]
   }
   ```

semantic 比較は `target/release/canonicalize_js`（既存）または OXC の parse → codegen 経由で行う。なければビルドする:

```bash
cargo build --release --bin canonicalize_js 2>/dev/null || true
```

#### Step 4-B-2: 任意：ビルド検証

ターゲットがビルドコマンドを持っている場合（`pnpm build` が成功する場合）、rsvelte でも同じビルドが通るか確認する:

```bash
# baseline build
( cd "$TARGET_PATH" && pnpm build ) > "compatibility/verify-svelte-compat/.cache/${NAME}-build-baseline.log" 2>&1
# rsvelte build (compiler swap 適用)
( cd "$TARGET_PATH" && NODE_OPTIONS="--import ./.rsvelte/loader.mjs" pnpm build ) \
  > "compatibility/verify-svelte-compat/.cache/${NAME}-build-rsvelte.log" 2>&1
```

両方が exit code 0 で、生成された JS の semantic 差分が無視可能なら **PASS**。

ビルド検証はオプションで、コストが高い場合（initial install + build に 数分以上かかる）はユーザーに確認する。

---

## Phase 5: 失敗分析と自動修正

Phase 4 で検出した失敗を **rsvelte 側の根本原因** に紐付け、修正する。

### Step 5.1: 失敗のカテゴライズ

```
1. パースエラー（rsvelte だけ failure）
   → src/compiler/phases/1_parse/ の問題
2. 意味解析エラー（rsvelte だけ warning / error / 出力 NaN）
   → src/compiler/phases/2_analyze/ の問題
3. コード生成差分（両方コンパイル成功 / 出力が違う）
   → src/compiler/phases/3_transform/ の問題
4. CSS スコーピング差分
   → src/compiler/phases/3_transform/css/ の問題
5. ランタイム差分（compile は通るがテストが落ちる）
   → 多くは transform 問題、一部 analyze 問題
```

### Step 5.2: 最小再現の作成

問題のあった `.svelte` ファイル / テストケースから、rsvelte 側の fixture テストに転記して再現させる:

```
tests/fixtures/{category}/<unique-name>/
  input.svelte         # 元ソースから抽出した最小ケース
  _config.json         # コンパイルオプション
  expected/            # 公式 Svelte の出力（参照）
```

`scripts/fixtures/generate-fixtures.mjs` を活用して expected を生成する。

### Step 5.3: 自動修正

公式実装（`svelte/packages/svelte/src/compiler/`）と rsvelte 実装（`src/compiler/`）を `Agent` で diff レビューさせ、原因箇所を特定して修正する。

```
Agent(subagent_type="general-purpose"):
  prompt: |
    rsvelte（公式 Svelte コンパイラの Rust ポート）で以下の互換性回帰が見つかった。
    根本原因を特定し、rsvelte 側を修正してほしい。

    ## 失敗ケース
    [問題のあった .svelte ファイル / テストケースの全文]

    ## 公式 Svelte の出力
    [baseline 出力]

    ## rsvelte の出力（または失敗内容）
    [rsvelte 出力 or エラー]

    ## 失敗カテゴリ
    [parse / analyze / transform / css / runtime]

    ## 公式実装の対応箇所
    [想定される svelte/packages/svelte/src/compiler/ 配下の関連ファイル]

    ## 手順
    1. 公式実装と rsvelte 実装の該当ファイルを比較
    2. 差分を特定
    3. rsvelte 側を修正（公式実装をミラーする）
    4. 該当 fixture テストで検証
    5. 全 cargo test --release を実行して回帰がないことを確認

    ## 制約
    - ターゲットリポジトリ自体は変更しない
    - 公式実装にない独自抽象を新規導入しない
    - 修正後 cargo fmt && cargo clippy --all-targets --all-features -- -D warnings がクリーンであること
```

### Step 5.4: 修正の妥当性チェック

修正後、以下を確認する:

```bash
cargo fmt --all
cargo clippy --all-targets --all-features -- -D warnings
cargo test --release --test compatibility_report  # 互換性レポート
cargo test --release                              # 全テスト
```

**いずれかが失敗したら、その修正は採用しない**（revert してユーザーに報告）。

---

## Phase 6: 再検証ループ

Phase 4 → Phase 5 を反復する。

```
loop:
  Phase 4 を再実行
  失敗ゼロ → break
  Phase 5 で修正
  反復回数 += 1
  反復回数 >= 5 → ユーザーに「残った失敗を別途 issue 化して進めますか？」と確認
```

各反復で以下を表示:

```
反復 N 回目:
  - 失敗総数: X → Y（前回比 -Z）
  - 残カテゴリ: parse=N, analyze=N, transform=N, css=N, runtime=N
  - 直近の修正: <一行サマリ>
```

### 反復終了条件

- すべての Critical（テスト失敗 / コンパイル失敗）が解消
- Major（出力差分は出るが意味的に同等）以下の指摘について、ユーザー承認のもと「許容差分」として記録（`.compat-meta.json` に書き込む）

---

## Phase 7: メタ情報保存とコミット

### Step 7.1: `.compat-meta.json` の更新

```json
{
  "name": "vite-plugin-svelte",
  "type": "tool",
  "lastVerifiedAt": "2026-05-02T12:34:56Z",
  "targetCommit": "772fdf542b09",
  "rsvelteCommit": "<HEAD>",
  "result": "pass",
  "summary": {
    "tests": { "total": 234, "passed": 234, "failed": 0 },
    "iterations": 1,
    "fixesApplied": []
  },
  "knownDifferences": []
}
```

これは `compatibility/verify-svelte-compat/<name>/.compat-meta.json` に保存し、`.gitignore` 対象にする。
代わりにルートの `compatibility/verify-svelte-compat/index.json` に **要約のみ** を git に含めて履歴にする:

```json
[
  {
    "name": "vite-plugin-svelte",
    "type": "tool",
    "lastVerifiedAt": "2026-05-02",
    "result": "pass",
    "rsvelteCommit": "..."
  }
]
```

### Step 7.2: ターゲット側に注入した変更の cleanup

`provide-rsvelte-compiler.mjs` は ターゲットの `package.json` に `pnpm.overrides['@rsvelte/compiler']` を注入する。検証完了後は **必ず** revert する:

```bash
( cd "$TARGET_PATH" && git checkout package.json )
# pnpm-lock.yaml も install 後に書き換わるので revert
( cd "$TARGET_PATH" && git checkout pnpm-lock.yaml 2>/dev/null || true )
```

`compatibility/verify-svelte-compat/<name>/.rsvelte/` と `compatibility/verify-svelte-compat/.cache/` は `.gitignore` 対象なので残置 OK。

### Step 7.3: コミット

修正が rsvelte 側に入っていれば、論理単位でコミット:

```bash
# 修正コミット（既に Phase 5 で個別にコミットされている想定）
# 最後に compatibility/verify-svelte-compat/ 関連の変更をまとめて:
git add compatibility/verify-svelte-compat/index.json .gitmodules compatibility/verify-svelte-compat/<name>
git commit -m "compat: verify <name> against rsvelte

- Mode: <add|update>
- Target commit: <SHA>
- Result: pass (X/X tests)
- Iterations: N
- Fixes: <一行サマリ>"

git push
```

---

## ヘルパースクリプト

このスキルは以下のヘルパーを使う:

| パス | 役割 |
|------|------|
| `.claude/skills/verify-svelte-compat/scripts/analyze-usage.mjs` | ターゲットを分析して JSON を出力（Phase 2） |
| `.claude/skills/verify-svelte-compat/scripts/build-rsvelte.sh` | rsvelte NAPI をビルドして配置（Phase 3） |
| `.claude/skills/verify-svelte-compat/scripts/provide-rsvelte-compiler.mjs` | `@rsvelte/compiler` 用ローカル wrapper を作成 + pnpm overrides 注入（Phase 4-A-0） |
| `.claude/skills/verify-svelte-compat/scripts/swap-compiler.mjs` | ターゲットの Svelte コンパイラを rsvelte に差し替え（Phase 4-A-2） |
| `.claude/skills/verify-svelte-compat/scripts/compare-app.mjs` | 全 `.svelte` ファイルを両コンパイラで比較（Phase 4-B） |

各スクリプトは単独でも実行可能（手動デバッグ用）。

---

## クイックリファレンス

```bash
# 新規追加
/verify-svelte-compat https://github.com/sveltejs/kit

# 既存サブモジュール更新検証
/verify-svelte-compat vite-plugin-svelte
/verify-svelte-compat language-tools

# 任意: 個別ヘルパーの直接実行
node .claude/skills/verify-svelte-compat/scripts/analyze-usage.mjs <path>
.claude/skills/verify-svelte-compat/scripts/build-rsvelte.sh
node .claude/skills/verify-svelte-compat/scripts/compare-app.mjs --target <path> --output <json>
```

---

## ワークフロー（実行時）

ユーザーが `/verify-svelte-compat $ARGUMENTS` を呼んだら:

1. **Phase 0**: 引数を解釈し、Mode A / B を決定
2. **Phase 1**: submodule を追加 / 更新
3. **Phase 2**: ターゲット分析 → ツール型 / アプリ型を判定（モノレポ等の曖昧ケースのみユーザー確認）
4. **Phase 3**: rsvelte NAPI ビルド → ターゲットに配置
5. **Phase 4**: 互換性検証実行
6. **Phase 5**: 失敗を rsvelte 側で自動修正
7. **Phase 6**: 4 → 5 を反復（5 回まで自動、その後はユーザー確認）
8. **Phase 7**: `.compat-meta.json` 更新 → コミット

各フェーズの結果は段階的に報告する。Phase 5 の修正コミットは個別に行い、最終 Phase 7 でメタ情報変更だけをまとめてコミットする。

## 心構え

- **公式 Svelte 出力が正**: 差分が見つかったら原則 rsvelte 側を直す
- **ターゲットには触らない**: 例外は「公式 Svelte 自体のバグでターゲット側も追従済」のような明確なケースのみ。その場合もユーザー確認必須
- **ベースラインが落ちる場合は別問題**: Phase 4-A の baseline （公式 Svelte でも） がそもそも失敗している場合、それはこのスキルの対象外。「baseline 失敗のため検証不可」として報告し、ターゲット側の問題として切り分ける
- **修正は最小限**: 1 つの失敗カテゴリにつき 1 つの修正コミット。リファクタリングや無関係な修正を混ぜない
- **rsvelte 側の clippy / fmt / 全テスト pass を維持**: Phase 5 の修正は必ず Step 5.4 のチェックを通してからコミット
