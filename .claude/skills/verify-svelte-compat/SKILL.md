---
name: verify-svelte-compat
description: Svelte を使う外部リポジトリ（ツール / ライブラリ / アプリ）を git submodule として取り込み、Svelte コンパイラを rsvelte に差し替えても完全に同等に動作するかを検証する。既存のサブモジュールが指定された場合は最新化したうえで再検証し、回帰があれば rsvelte 側を自動修正する。「/verify-svelte-compat <url-or-name>」で実行。
argument-hint: "<github-url | existing-submodule-name>"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, Skill, WebSearch, WebFetch
effort: max
---

# verify-svelte-compat

外部 Svelte リポジトリ（ターゲット）で rsvelte が公式コンパイラと同じ出力・挙動を出すか検証する。
修正は **rsvelte 側のみ**。ターゲットは公式互換のリファレンスとして扱い、変更しない。
**ツール型** = ソースが `svelte/compiler` / `@rsvelte/compiler` を import（自前テストで検証）、
**アプリ型** = `.svelte` 多数でコンパイラ import なし（全ファイル semantic 比較）。

前提: `cargo` / `pnpm` / `node>=22` / `git`、`submodules/svelte` 初期化済み。
`compatibility/verify-svelte-compat/` は **ディレクトリごと gitignore**（`.gitignore:110`）: submodule 追加は
`-f` が要り、`.compat-meta.json` / `index.json` は追跡されない。

## ヘルパー（`.claude/skills/verify-svelte-compat/scripts/`）

| スクリプト | 役割 |
|---|---|
| `analyze-usage.mjs <target>` | ターゲット分析 JSON を stdout へ |
| `build-rsvelte.sh [target]` | `cargo build --release -p rsvelte_napi --lib` → `<target>/.rsvelte/<NODE_NAME>` へコピー。最終行に `NODE_NAME`（例 `rsvelte.darwin-arm64.node`）を出力 |
| `provide-rsvelte-compiler.mjs --target <p> --rsvelte-binding <abs.node>` | `.cache/rsvelte-compiler-pkg/{package.json,index.cjs,index.d.ts}` を生成し、ターゲット `package.json` の `pnpm.overrides['@rsvelte/compiler']` を `file:` に書き換える |
| `swap-compiler.mjs --target <p> --rsvelte-binding <abs.node>` | `<target>/.rsvelte/{loader.mjs,hooks.mjs,svelte-shim.cjs,.swap-applied}` を生成。**`package.json` は触らない**。適用は `NODE_OPTIONS="--import ./.rsvelte/loader.mjs"` |
| `compare-app.mjs --target <p> --rsvelte-binding <abs.node> --output <json>` | 全 `.svelte` を client/server で両コンパイラに通し `target/release/canonicalize_js` で比較。バイナリが無ければ **exit 2（fallback なし）**。差分 / rsvelte エラー / canonicalize エラーでも exit 2 |

## Phase 0: 引数解釈

`SUBMODULES=$(git config --file .gitmodules --get-regexp '\.path$' | awk '{print $2}')` に対して:

| `$ARG` | Mode |
|---|---|
| `^(https?://\|git@)` | **add**、`URL=$ARG`、`NAME=$(basename "$URL" .git)` |
| `SUBMODULES` に完全一致、または basename 一致（`awk -F/ '$NF==n'`） | **update**、`TARGET_PATH`、`NAME=$(basename "$TARGET_PATH")` |
| 空 / どちらでもない | **ユーザーに確認**（登録済み一覧を提示） |

既存サブモジュールは全て `submodules/<name>`。`vite-plugin-svelte` は `apps/npm/vite-plugin-svelte` に
vendored されておりサブモジュールではない。報告: Mode / Target / NAME。

## Phase 1: ターゲット取得

```bash
# Mode A（既存パスなら中止）
TARGET_PATH="compatibility/verify-svelte-compat/$NAME"
git submodule add -f "$URL" "$TARGET_PATH" && git submodule update --init "$TARGET_PATH"
# Mode B: PREV_COMMIT=$(git -C "$TARGET_PATH" rev-parse HEAD) を記録。.gitmodules に branch があれば
git submodule update --remote --merge "$TARGET_PATH"
# 共通（branch なし）: 最新の安定タグ（^v?X.Y.Z$）、無ければ origin/HEAD
( cd "$TARGET_PATH" && git fetch --tags -q
  T=$(git tag -l --sort=-version:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
  git checkout -q "${T:-origin/HEAD}" )
```

報告: パス / コミット `PREV → NEW` / タグ。

## Phase 2: ターゲット分析

```bash
node .claude/skills/verify-svelte-compat/scripts/analyze-usage.mjs "$TARGET_PATH"
```

出力 JSON: `name`, `type` (`tool`|`app`|`monorepo`|`unknown`), `alreadySwapped`, `svelteVersion`,
`buildSystem` (`kit`|`vite`|`webpack`|`rollup`|`other`), `compilerEntryPoints`, `testCommands`,
`buildCommands`, `svelteFileCount`, `monorepoPackages`, `hasWorkspaces`, `scripts`。

| type | 扱い |
|---|---|
| `tool` | Phase 4-A |
| `app` | Phase 4-B |
| `monorepo` / `unknown` | **ユーザーに確認**: 全体 / サブパッケージ限定（候補は `monorepoPackages`）/ tool・app として扱う |

`alreadySwapped: true` なら Phase 4-A-2 の swap を省き、4-A-0 で `@rsvelte/compiler` をローカル供給する。
報告: タイプ / ビルドシステム / Svelte バージョン / 検証戦略。

## Phase 3: ビルド

```bash
NODE_NAME=$(.claude/skills/verify-svelte-compat/scripts/build-rsvelte.sh "$TARGET_PATH" | tail -1)
cargo build --release -p rsvelte_devtools --bin canonicalize_js
BINDING="$(pwd)/${TARGET_PATH}/.rsvelte/${NODE_NAME}"
```

NAPI の export は `crates/rsvelte_napi/src/lib.rs`（`compile` / `compileModule` / `parse` / `preprocess` / `svelte2tsx` 他）。

## Phase 4-A: ツール型

```bash
CACHE=compatibility/verify-svelte-compat/.cache; mkdir -p "$CACHE"
# 4-A-0 alreadySwapped のみ（先に package.json / pnpm-lock.yaml を退避）
node .claude/skills/verify-svelte-compat/scripts/provide-rsvelte-compiler.mjs --target "$TARGET_PATH" --rsvelte-binding "$BINDING"
# 4-A-1 install + baseline
( cd "$TARGET_PATH" && (pnpm install --frozen-lockfile || pnpm install || npm install) )
( cd "$TARGET_PATH" && pnpm test ) > "$CACHE/${NAME}-baseline.log" 2>&1; BASELINE_EXIT=$?
# 4-A-2 swap（alreadySwapped でなければ）
node .claude/skills/verify-svelte-compat/scripts/swap-compiler.mjs --target "$TARGET_PATH" --rsvelte-binding "$BINDING"
# 4-A-3
( cd "$TARGET_PATH" && NODE_OPTIONS="--import ./.rsvelte/loader.mjs" pnpm test ) > "$CACHE/${NAME}-rsvelte.log" 2>&1; RSVELTE_EXIT=$?
# 4-A-4
diff "$CACHE/${NAME}-baseline.log" "$CACHE/${NAME}-rsvelte.log" > "$CACHE/${NAME}-diff.log" || true
```

| baseline | rsvelte | 判定 |
|---|---|---|
| pass | pass、差分がタイムスタンプ等のみ | PASS |
| pass | fail | REGRESSION → Phase 5 |
| fail | — | ターゲット側の問題。修正対象外、ユーザーに報告 |

install がターゲット由来で失敗したら `pnpm install --filter '!<問題パッケージ>'` を試し、
それでも駄目なら 4-A を飛ばして 4-B のみで検証する旨を **ユーザーに明示**（4-B は install 不要）。

## Phase 4-B: アプリ型

```bash
node .claude/skills/verify-svelte-compat/scripts/compare-app.mjs --target "$TARGET_PATH" \
  --rsvelte-binding "$BINDING" --output "$CACHE/${NAME}-app-report.json"
```

出力 JSON: `totalFiles`, `bothCompiled`, `semanticEqual`, `semanticDiff`, `canonicalizeError`,
`rsvelteError`, `officialError`, `bothError`, `details[{file, mode, category, ...}]`
（category: `semantic-diff` / `rsvelte-error` / `official-error` / `canonicalize-error`）。
コンパイルオプションは `css: 'external', dev: false`。

任意のビルド検証（install + build に数分以上かかるなら **ユーザーに確認**）:

```bash
( cd "$TARGET_PATH" && pnpm build ) > "$CACHE/${NAME}-build-baseline.log" 2>&1
( cd "$TARGET_PATH" && NODE_OPTIONS="--import ./.rsvelte/loader.mjs" pnpm build ) > "$CACHE/${NAME}-build-rsvelte.log" 2>&1
```

両方 exit 0 かつ生成 JS の semantic 差分が無視可能なら PASS。

## Phase 5: 失敗分析と修正（rsvelte 側のみ）

| 症状 | 該当 (`crates/rsvelte_core/src/compiler/phases/`) |
|---|---|
| rsvelte だけパースエラー | `1_parse/` |
| rsvelte だけ warning / error / NaN | `2_analyze/` |
| 両方成功、出力差分 | `3_transform/` |
| CSS スコーピング差分 | `3_transform/css.rs` |
| compile は通るがテスト失敗 | 主に `3_transform/`、一部 `2_analyze/` |

1. **最小再現**: `compatibility/pattern-corpus/issues/<name>.svelte` に置き、README の `issues/` 表に行を追加
   （`scripts/ci/check-pattern-corpus-docs.mjs` が双方向に検査。修正と同じ PR で入れる）。
   単体で pin するなら `crates/rsvelte_core/tests/<name>.rs`。公式出力は
   `submodules/svelte/packages/svelte/src/compiler/index.js` から生成する。
2. **修正**: `Agent(general-purpose)` に失敗ケース全文 / 公式出力 / rsvelte 出力 / カテゴリ / 公式実装の想定箇所
   （`submodules/svelte/packages/svelte/src/compiler/`）を渡し、公式実装をミラーして修正させる。
   制約: ターゲット不変、公式にない独自抽象を足さない。
3. **妥当性**（どれか失敗なら revert してユーザーに報告）:

```bash
cargo fmt --all && cargo clippy --all-targets --all-features -- -D warnings
pnpm run compatibility-report
cargo test --release
```

## Phase 6: 再検証ループ

Phase 4 → 5 を失敗ゼロまで反復し、毎回「失敗総数 X → Y / 残カテゴリ / 直近の修正」を報告。
**5 回で収束しなければユーザーに確認**（残りを issue 化するか）。Critical（テスト失敗 / コンパイル失敗）は
全解消が条件。意味的に同等な出力差分は **ユーザー承認のうえ** `knownDifferences` に記録。

## Phase 7: メタ情報保存とコミット

1. `compatibility/verify-svelte-compat/<name>/.compat-meta.json`（gitignore 対象）に
   `name, type, lastVerifiedAt, targetCommit, rsvelteCommit, result, summary{tests{total,passed,failed}, iterations, fixesApplied[]}, knownDifferences[]`
   を保存し、要約を同ディレクトリの `index.json` に追記。
2. cleanup（**必須**）: `( cd "$TARGET_PATH" && git checkout package.json pnpm-lock.yaml )` で
   `provide-rsvelte-compiler.mjs` の注入を戻す。`.rsvelte/` と `.cache/` は残置可。
3. コミット: Phase 5 の修正は 1 カテゴリ 1 コミットで個別に。最後に `.gitmodules` と gitlink をまとめる。

```bash
git add .gitmodules "$TARGET_PATH"
git commit -m "compat: verify <name> against rsvelte

- Mode: <add|update>
- Target commit: <sha>
- Result: pass (X/X tests)
- Iterations: N
- Fixes: <一行>"
git push
```

## クイックリファレンス

```bash
/verify-svelte-compat https://github.com/sveltejs/kit   # Mode A
/verify-svelte-compat language-tools                    # Mode B → submodules/language-tools
```
各ヘルパーは上の表の引数で単独実行できる（手動デバッグ用）。
