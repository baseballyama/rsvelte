# rsvelte corpus burn-down — 継続セッション用キックオフ

新しいセッションでこのファイルの内容をそのまま指示として使う（または貼る）。
まず memory の `project_corpus_burndown_progress`（手順・既修正・知見の要約）を読むこと。

## ゴール

`compat/corpus/known-failures.json` を **125 → 0** に減らす（公式 Svelte コンパイラと
CSR/SSR がバイト一致）。パフォーマンスのリグレッションを出さない。大幅リファクタ可。

## 作業環境（既存。新規 worktree は作らない）

- worktree: `/Users/baseballyama/git/rsvelte-corpus-burndown`
- ブランチ: `feat/corpus-burndown`（origin にプッシュ済み、HEAD で 125 件）
- すべてここで作業し commit → push する。

## ループ（1 修正ずつ。napi ビルドは ~2.5 分）

```bash
cd /Users/baseballyama/git/rsvelte-corpus-burndown
# 1. 編集 → 2. build
CARGO_TARGET_DIR=$PWD/target cargo build --release --features napi --lib
# 3. stage（Linux は .so）
cp target/release/librsvelte_core.dylib .corpus-cache/rsvelte.node
# 4. compile → 5. verify（corpus:compile 直後は必ず oxfmt あり = --no-fmt を付けない）
pnpm run corpus:compile
node scripts/compat-corpus/verify.mjs --max-print 10
# 6. バイト一致フィクスチャ（別 target で。初回のみ generate-fixtures）
pnpm run generate-fixtures   # 初回のみ
CARGO_TARGET_DIR=/tmp/corpus-test-target RUST_TEST_THREADS=2 RAYON_NUM_THREADS=2 \
  RUST_MIN_STACK=33554432 cargo test --release --test runtime --test ssr --test compiler_fixtures
# 7. 緑なら baseline 更新を同じコミットに含めて commit & push
node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline
cargo fmt && git add -A && git commit && git push
```

コミットメッセージ末尾: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

`--no-fmt` はトレーが既に oxfmt 済みのとき（再比較）だけ。`corpus:compile` 後は oxfmt を走らせる。

## 重要な前提（確立済み）

- 比較は **AST 構造一致**（`normalize.astEquivalent` / acorn、正規表現は使わない）。
  コメント位置・`${}` 折り返し・冗長括弧・文字列クォートは**既に吸収済み**。
  よって残りの差分は「実際にコードが違う」本物の構造バグだけ。
- **禁止**: レイアウト目的の文字列ポストパスをコンパイラに足すこと（プロジェクト規約）。
  出力が違うなら AST かプリンタが違う。比較レイヤーの正規化（`normalize.mjs`）か
  コンパイラ本体を直す。

## 攻略順（重要）

残り 125 ≒ **parseable が大半 / unparseable 約8 / CSS 約7**（実数は下記スクリプトで再計算）。

- **parseable（acorn が両出力をパースできる）を最優先**。1 修正 = 1 件パス。
- unparseable 8 件（await-in-non-async）は raw 比較で複数差分が絡むので後回し。
- 1 セッション = 1〜数クラスタに絞る。

parseable 一覧の再生成（前セッションの `_parseable.mjs` 相当。`scripts/compat-corpus/` に
一時ファイルを作り、実行後に削除する）:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";
const C = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../compat/corpus");
const rep = JSON.parse(fs.readFileSync(path.join(C, "report.json"), "utf8"));
const rd = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);
const ok = (c) => {
  try {
    parse(c, {
      ecmaVersion: "latest",
      sourceType: "module",
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      allowImportExportEverywhere: true,
    });
    return true;
  } catch {
    return false;
  }
};
const pIds = [];
for (const f of rep.failures) {
  if (f.verdict === "css-mismatch") continue;
  let both = true,
    any = false;
  for (const t of ["client", "server"]) {
    const e = rd(path.join(C, "expected", f.id, `${t}.js`)),
      a = rd(path.join(C, "actual", f.id, `${t}.js`));
    if (e && a && e !== a) {
      any = true;
      if (!ok(e) || !ok(a)) both = false;
    }
  }
  if (any && both) pIds.push(f.id);
}
fs.writeFileSync("/tmp/parseable.json", JSON.stringify(pIds, null, 1));
console.log("parseable:", pIds.length);
```

## 既知クラスタ / 落とし穴

- **命名 `canvas_1`/`form_1`/`progress_1`（~5 件）**: 公式は未宣言グローバル参照を
  `Scope.reference` → `root.conflicts.add` する。rsvelte の `conflicts` は宣言のみ。
  → アナライザで「スクリプト/テンプレで参照されるが未宣言の識別子」を `conflicts` に
  追加する必要（高 blast-radius。`collect_identifiers_from_node` が再利用候補）。
- **`{const}` DeclarationTag の each-item が `$.get()` 未ラップ**（テンプレ変換でなく
  instance-script パイプラインを通るため）。
- **compound `+=` のサーバ展開**（`count += 1` → `count = count + 1`）: クライアント
  lowering で情報が失われ post-process では復元不可。lowering 側を直す必要。
- **フラグメント境界の空白**（末尾トリム不足 / 削除スロット起因の二重スペース）: 文脈依存。
  `clean_nodes` 相当の集約ポートが筋だが高リスク。
- **再挑戦しない**: `yScale(tick)` → `yScale()(tick)` のテキスト callee ラップ
  （derived-unowned / derived-map を別々に壊して revert 済み）。import クォートの単独変更も
  0 件改善で revert 済み（unparseable ファイルは複数差分が絡むため）。
- デバッグ: `node scripts/compat-corpus/one.mjs '<id>' [--target client|server] [--raw]`

## 規律

- 1 変更 1 検証。corpus verify で「fixed 件数」と「regression なし」を確認してから commit。
- リグレッションが出たら **revert**（検証ネットが効く）。
- **0 件改善の変更は commit しない**（speculative 変更を残さない）。
- 表面の diff（first-diff 行）は誤誘導しがち。実際の根本原因は別の場所にあることが多い
  （例: `root_6` の `from_svg` は infer_namespace でなく parent-tracking が原因）。
