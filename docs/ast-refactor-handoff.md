# Phase-3 AST リファクタ — 次セッション引き継ぎ手順書

> **ゴール（ユーザー指示・継続中）:** Phase-3 (3_transform) の **テキストベース処理を1箇所も残さず**、
> oxc AST 構築 + `rsvelte_esrap` 印字に完全移行する（サーバ SSR を最優先、クライアント CSR も）。
> 数週間規模の多数 PR からなる取り組み。**常時グリーン**（コーパス無回帰 + 全フィクスチャ + CI）を厳守。

このファイルだけ読めば再開できるように書いてある。まず本ファイル → `docs/phase3-ast-refactor-plan.md`
（特に末尾の「Findings (2026-06-19)」）→ `docs/corpus-remaining-work.md` の順で読むこと。

---

## 000. 改訂（2026-08-08）: `collect_vars` / `line_loop` の職務地図 — **サイジングの訂正を含む**

`transform_instance_script_for_visitors`（`client/mod.rs`）の 2 段について、実際に何をしているかの
分解と、AST 化を **阻む性質** の記録。以降のサイジングはここを起点にすること。

### ★ テストは「走らなかった」と「通った」が同じ終了コードになる ★

**チェック: 要求したテストバイナリ数と `Running` 行の数を数え合わせること。** 走らなかった
テストは exit 0 で、通ったテストと区別がつかない。既知の 2 機構:

1. **`cargo test` はテストバイナリ間で fail-fast。** 途中のバイナリが失敗すると以降は走らない
   （行数が減り、exit は非ゼロ）。`--no-fail-fast` で回避。
   実例: `compiler_fixtures` が未生成フィクスチャで失敗 → 後続 3 本が未実行。
   **未生成フィクスチャはセットアップ不備であって判定ではない**（`pnpm run generate-fixtures`）。
2. **バックグラウンドジョブのログを完了前に読む。** foreground タイムアウトで
   バックグラウンドに移されたジョブの出力ファイルを「最終」として読むと、書き込み途中を見る。
   **見分け方: `test result:` 行に対応する `Running` 行が足りないログは書き込み途中。**
   （1 実例で「cargo が 3 本中 2 本しか走らせず exit 0」と誤報告した。完走させて再実行したら
   同一コマンドで 3 本とも走った。**cargo の欠陥ではなかった。**）

**★ 上の 2 番目は「チェックは正しいが原因診断は誤り」という形をしている。**
食い違いを見つけた検査（`Running` 行を数える）は正しく、そこから立てた機構の説明が誤っていた。
**検査の有効性と、その結果の説明の正しさは、別々に検証すること。**

### ★ CI: ステップ名は「どこで死んだか」であって「なぜ死んだか」ではない ★

本 PR で `Run benchmarks` の **step 6「Build the benchmark targets」** が失敗した。
この PR は `profile.rs` / `compile_profile.rs` を触っている = **ベンチのビルド入力を変えている**。
ステップ一覧だけ見れば「自分の変更でベンチのビルドが壊れた」と読むのが最も自然で、
このリポジトリで出うる帰属としては十分もっともらしい。

**実際のログ:**
```
##[error]The runner has received a shutdown signal. ...
##[error]Process completed with exit code 143.
```
35KB のログ中にコンパイルエラーは 1 件も無い。既知の runner 衝突（exit 143 → 再実行）。

**教訓の階層:**
1. チェック名では不十分 → **ステップ一覧を見よ**（既知）
2. **ステップ一覧でも不十分 → ログを読め。** ステップ名は死亡位置であって死因ではない。
   死亡位置が変更内容ともっともらしく符合するときほど、ログを読まずに納得してしまう。

**かつ「再実行すれば直るだろう」は判定ではない。** ログを持たない状態で
「たぶん既知の衝突」と判断してマージしてはいけない。**証拠を得てから進むこと。**

### ★ 一般則: プロキシが対象と同じ名前を持つと、プロキシに見えなくなる ★

このセッションで**同じ形の誤りが 4 回**起きた。いずれも「量 X」と称する測定が
実際には「X の代理 Y」を測っており、**名前が同じだったので誰も『Y は X の何を除外するか』を
問わなかった**:

| 名乗り | 実際に測っていたもの | 除外していたもの |
|---|---|---|
| 「legacy ファイル」 | `^\s*$:` にマッチするファイル | `export let` だけの legacy（母集団を 1/3 過小） |
| 「スキャンが走った」 | スキャン関数が**呼ばれた** | early-out で即 return した回 |
| 「`line_loop` の時間」 | `process_accumulated` を**含む**囲い | 文字スキャナ自体は残余 |
| 「計測パスの時間」 | warmup を drain し**残した**累算器 | warmup 100 ファイル分が混入 |

**プロキシが対象と同じ名前で呼ばれているとき、それはプロキシとして読まれない。**
新しい計測量を導入するときは、**名前に代理であることを織り込むか、
「この量が除外するものは何か」を doc コメントに 1 行書くこと。**
（AGENTS.md の「ゲートは何を見ていないか」と同じ問いを、計測量にも適用する。）

### ★ 訂正: 「`line_loop` は 22.7%」は文字スキャナの数字ではない ★

`record_st_line_loop`（`client/mod.rs`）は **`process_accumulated` を含めて**ループ全体を囲っている。
`compile_profile` はすでに両者を分けて印字する（`line_scan` 行 = `line_loop − process_accum`）。

**★ `compile_profile` の script-text 配下の % は全て「total compile 比」である ★**
（`compile_profile.rs`: `val / ms(total) * 100.0`）。**したがって
`script_text% × process_accum%` のように掛け算してはいけない — 二重に割ることになる。**
`process_accum` の compile 全体に対するシェアは、その行の数値**そのもの**。

#### ★★ 計測器のバグ（原因特定・修正済み）— 旧数値は全て無効 ★★

`compile_profile` の warmup（先頭 100 ファイルを `compile()`）の後、
`take_breakdown()` は呼ばれていたが **`take_script_text_breakdown()` は呼ばれていなかった**。
親（`SCRIPT_TEXT`）だけが drain され、**script-text の全ステージタイマとカウンタ
（`prenormalize` / `collect_vars` / `line_loop` / `process_accum` / `in_function` /
`statements` / 本 PR の `COUNTERS` 全部）は warmup の 100 ファイル分を保持したまま**
計測パスに加算されていた。

**★ 一次証拠は時間ではなく件数である。★**
`SELF-CHECK` 行の `entries`（= `process_accumulated` の呼び出し回数）を old/fixed で比較すると、
混入は**厳密に数えられる**。混入率は時間比ではなく
`warmup のうち instance script を持つファイル数 / N のうち instance script を持つ数`。

| corpus | files | `entries` old → fixed | delta | warmup |
|---|---|---|---|---|
| smelte | 74 | 144 → 72 | **72** | 74 |
| layercake | 177 | 276 → 176 | **100** | 100 |
| carbon | 1324 | 1393 → 1293 | **100** | 100 |
| SMUI | 449 | 541 → 441 | **100** | 100 |

**カウントなので負荷で動かない。** 唯一ずれて見える smelte がむしろ最強の行で、
delta 72 に対し warmup は 74 ファイル — 差の 2 は **instance script を持たない 2 ファイル**で、
それらはそもそもクロージャに入らない。fixed 側が 74 ファイルで 72 entries を報告することが、
この不足分を言い訳ではなく**確認**にしている。

時間側の (100 + N) / N は**この事実の帰結**であり、かつ**ノイズのあるチャンネル**である。
（これは「予測値」ではなく **下限**: warmup は `rsvelte_core::compile` **全体**を呼ぶのに対し、
計測ループは `transform_component` だけを呼ぶので、warmup の 1 ファイルあたり寄与は計測側より
大きく、実測比は下限**以上**になるのが正しい挙動。）

| corpus | N | 下限 (100+N)/N | 実測 Σstages/parent |
|---|---|---|---|
| smelte | 74 | 2.00 | **2.01** |
| sveltestrap | 129 | 1.78 | 1.70 |
| svelte-ux | 198 | 1.51 | **1.76** ≥ |
| bits-ui | 617 | 1.16 | 1.12 |
| skeleton | 686 | 1.15 | 1.13 |
| flowbite | 1296 | 1.08 | **1.16** ≥ |
| layerchart | 1400 | 1.07 | 1.03 |
| shadcn | 1682 | 1.06 | **1.08** ≥ |

**下限を超える 3 行（svelte-ux / flowbite / shadcn）は散らばりではなく裏付け** —
超過分は warmup が 1 ファイルあたり多くの仕事をしていることで説明される。

**★ 同一 run 内の比（Σstages/parent）と、2 バイナリ A/B は頑健性が違う。★**
前者は分子・分母が**同じ run** から出るのでマシン負荷が相殺される。後者は相殺しない。
実際、old/new バイナリ直接比較は **carbon で符号が反転した**（`process_accum` 21.3% →
修正後 **30.5%**）。分子から時間を取り除くだけの修正で増えることは**あり得ない**ので、
これは計測の失敗である（原因: 3 エージェントが同時に `cargo build` していた ＝ 2 アームが
別のマシンを見た。1 アーム 1 ショット・逐次・非交互のプロトコル）。
同じ経路で得た smelte 2.24 / layercake 1.57（下限 1.565）は予測と一致したが、
**運が良かっただけ**で、方向の裏付け以上には使えない。

**この節から出る一般則:** ステージタイマを 1 本置くたびに、その隣に**決定論的カウンタ**
（呼び出し回数・走査バイト数など）を置くこと。時間行が意外な値を出したとき、
**仕事が動いたのか時計が動いただけなのか**を問えるようにするため。

**「legacy でのみ壊れる」ように見えたのは、手元の legacy リポジトリがたまたま
小さかったから**（74 / 129 / 198 ファイル）。**legacy とは無関係**だった。
`take_script_text_breakdown()` を warmup 後に追加して修正。修正後は全 11 コーパスで
`prologue+earlyout` が +0.05〜+1.18ms、`in_function ≤ parent`、Σ ≤ parent で閉じる。

**教訓: 再現性は正しさではない。** ±0.1ms で 3 回再現したが、系統誤差は完璧に再現する。
`nested 0` / `entries == parent_calls` / pairing 全通過でも**別の経路**で壊れていた。

#### 実測（prod、静穏時、**warmup 修正後**、11 コーパス。★平均を取らないこと★）

**★ この表は warmup 修正**後**の値である。修正前の同じ表から「line loop は legacy コスト」という
（撤回済みの）読みが出た。同じ行から再導出されないよう、交絡を明示する: ★**
warmup 混入は **N が小さいほど大きい**（下限 (100+N)/N）。そして**このコーパスでは
ファイル数と legacy 密度が相関している** — legacy 濃厚な repo は小さく
（smelte 74 / sveltestrap 129 / svelte-ux 198）、runes 極の repo は大きい
（shadcn 1682 / layerchart 1400 / flowbite 1296）。**修正前はこの 2 つが完全に交絡していた**ため、
「legacy だから遅い」と「小さいから汚染が大きい」が区別できなかった。
下の値は修正後なので交絡していないが、**表だけを見た読者にはそれが分からない**。
再測するときは N と legacy 密度を必ず別々に記録すること。

| corpus | `$:` | `export let` | script_text | **process_accum** | line_scan |
|---|---|---|---|---|---|
| shadcn-svelte | 0 | 0 | 7.4% | **1.0%** | 0.8% |
| bits-ui | 0 | 0 | 12.3% | **1.4%** | 1.0% |
| svar-core | 0 | 2 | 11.6% | **1.5%** | 1.2% |
| layerchart | 0 | 5 | 11.6% | **1.5%** | 1.3% |
| skeleton | 0 | 0 | 10.9% | **1.7%** | 1.2% |
| flowbite-svelte | 0 | 2 | 16.3% | **2.0%** | 1.4% |
| layercake | 50 | 1 | 12.6% | **4.4%** | 1.1% |
| **svelte-heroicons** | **1** | **293** | 16.5% | **12.1%** | 1.8% |
| svelte-ux | 196 | 103 | 19.7% | **16.1%** | 0.8% |
| sveltestrap | 126 | 66 | 26.0% | **20.2%** | 1.3% |
| smelte | 97 | 47 | 32.3% | **26.6%** | 1.4% |

#### ★★ 「双峰・中間なし」は**誤り**だった（自説の撤回）★★

`export let` は多いが `$:` が無い母集団を実測せよ、という指示に従って
**svelte-heroicons（294 ファイル中 293 が `export let`、`$:` は 1）** を測ったところ
**12.1%** — runes 極（1.0〜2.0%）と `$:` 極（16.1〜26.6%）の**中間**に落ちた。
layercake（`$:` 50 本）も **4.4%** で中間。

**したがって `process_accum` シェアは連続分布であり、2 極ではない。**
1.0 → 1.5 → 2.0 → 4.4 → 12.1 → 16.1 → 20.2 → 26.6% と埋まる。
以前ここに書いていた「15〜50 倍の差、中間なし」は**両端だけを標本していた**ことによる
アーティファクト（かつ小コーパス側が warmup で 2 倍に膨れていた）。

**含意**: `$:` の有無は良い**判別子ではない**。`export let`（= runes 無効）だけでも
`process_accum` は 12% に達する。母集団の重みは `$:` の 12.29% ではなく
**和集合の 18.24%**（バイト）で考えるべきで、その 18.24% の中身は一様ではない。

**⚠ svelte-heroicons の代表性**: アイコンラッパの小ファイル 294 本で、
1 ファイルあたりの絶対時間は小さい。**この 1 点で `export let` 母集団全体を代表させないこと。**
`export let` が多く**かつ**ファイルが大きい repo をもう 1 つ測るのが次の一手。

#### 母集団の重み — ★**ライブラリコーパス（`submodules/`）限定**★

**★ ファイル数で数えてはいけない。★** 独立に再導出した実測（`submodules/` 全体、
`node_modules` 除外、13,121 ファイル / 15,151,873 バイト）:

| マーカー | files | files% | bytes% | 平均サイズ |
|---|---|---|---|---|
| `^\s*\$:` のみ | 478 | 3.64% | **12.29%** | **3,898 B** |
| `^\s*export let` のみ含む | 2,004 | 15.27% | 16.73% | 1,265 B |
| **和集合（= legacy 判定に近い）** | **2,157** | **16.43%** | **18.24%** | 1,281 B |
| 非 legacy（和集合の補集合） | 10,964 | 83.57% | 81.76% | 1,129 B |

**(a) ファイル数 3.6% は、バイトでは 12.3% になる** — `$:` ファイルは平均 3,898 B で、
非 legacy の 1,129 B の **3.5 倍**。ファイル数は仕事量の代理として過小。

**(b) しかし `$:` は legacy マーカーとして不完全。** `export let` も runes を無効化するが
`$:` を含まないファイルが大量にある。**legacy 全体はバイトで 18.24%**（12.3% ではない）。
`$:` だけを数えると legacy 母集団を約 3 分の 1 過小評価する。

**(c) 平均サイズ差は `$:` 部分集合の性質であって legacy 全体の性質ではない。**
`$:` ファイルは 3.5 倍大きいが、`export let` ファイルは 1,265 B で普通のサイズ。
和集合の平均は 1,281 B = 非 legacy の 1.13 倍にすぎない。**「legacy は大きい」と
一般化しないこと** — 大きいのは `$:` を使う深い legacy だけ。

**(d) 18.24% は時間重みの下限。** `script_text` は指数 > 1.0 の唯一のバケット
（smelte 実測 1.989、prod 全体 1.395）。超線形バケットは大きいファイルをバイト比以上に
重く数える。**ただしここに指数を掛けて 1 つの数字にしないこと** — 未測定量の合成は
このセッションで 3 回間違いを生んだ経路そのもの。**時間シェアを決めるのは上の compile-share 表。**

**★ (e) これは「ライブラリ」の数値であって「出荷される Svelte ソース」ではない。★**
`submodules/` は bits-ui / flowbite / shadcn-svelte / skeleton / layerchart 等の**ライブラリ**集合。
アプリケーション側コーパス（huly 2,123 / open-webui 650 / carbon 287 / SMUI 449）は
runes 率が huly 0.4% / open-webui 0.3% / carbon 0.0% / SMUI 59.9% と大きく異なる。
**アプリではこの 18.24% は相当に高くなる可能性が高い。** 公開ライブラリはプリコンパイル済みで
出荷されることが多いので、実コンパイル量に近いのはアプリ側。**両方を並べて載せること**
（ライブラリとアプリの乖離それ自体が結果であり、ゲート間で母集団が食い違い続ける理由）。
なお runes 率と `$:` 率は補集合ではない（どちらも使わないファイルがある）ので、
アプリ側は runes 率から推定せず直接測ること。

**分布は双峰**（リポジトリは ~0% か ≥10%、中間がない）。この形は上の数値訂正を通じて不変で、
**だからこそ「2 つの数値と条件」が正しい報告形**であり、単一の混合値はコーパス構成
（我々の選択）についての主張にしかならない。

同じ epic に対する 5 つ目の数字なので、**どの量・どの母集団を測っているかを毎回明示すること**
（再パース時間 3-4% / パス融合 数% / 移植 0.1% / 除去 ~16% / `process_accum` は上表）。

`script_text_transform` 自体のシェアもコーパス依存が極端: **bits-ui prod 4.5% 〜 smelte prod 73.7%**。
「27-29%」は 1 つの母集団の値。**この epic について単一の数値を出すときは、必ずどの母集団かを書くこと。**

#### ★★ これは「~16%」の反証ではなく、テキスト機構**内部**の帰属替えである ★★

> **行スキャナの撲滅と ~16% の回収は、別の作業項目である。**
> スキャナが担っているのは**正しさ**の論拠（#2351 / #2347 / #2590 / #2599 — コメントがコードとして
> 読まれる欠陥クラス）。**時間**を担っているのは `process_accumulated` — AST 化済みの各段が
> **文ごとに 1 回ずつ再パースする**こと。**前者をやっても後者は手に入らない。**
> スキャナの欠陥を根拠に perf の数値を正当化する計画は、**別の変更のための証拠を引用している。**

質量は依然としてテキスト機構の中にある。移動したのは機構**内の**所在であって、機構の外に出たのではない。

**★ epic の正直な見出しは「1 つの数値」ではなく「2 つの数値と 1 つの条件」★**

> `process_accumulated` の除去は、**runes コードで 1〜2%、`export let` 主体の legacy で ~12%、
> `$:` 主体の legacy で 16〜27%** の作業項目である（warmup 修正後の実測、上表）。
> 条件は連続量であって二値ではない — `$:` の有無ではなく **runes が無効化される度合い**。
> 実出荷の大規模ライブラリは `$:` も `export let` も**ゼロ**（shadcn / bits-ui / skeleton / melt-ui / runed）。

#### ★★ アプリケーション母集団の直接実測（2026-08-08）— epic の数値はこれ ★★

ライブラリを重み付けするには母集団マーカーが要るが、そのマーカー（`$:`）は**引退した**ので、
重み付けをやめて**母集団を直接測った**。

| repo | files | legacy(bytes) | script_text | **process_accum** | line_scan | `$:` |
|---|---|---|---|---|---|---|
| carbon/src | 291 | 87.9% | 36.3% | **30.2%** | 1.5% | 765 |
| open-webui/src | 650 | 70.3% | 30.7% | **25.7%** | 1.1% | 577 |
| huly/plugins | 2126 | 74.9% | 27.8% | **22.5%** | 1.2% | 3312 |
| **SMUI**（陰性対照） | 449 | **0.00%** | 17.6% | **2.1%** | 1.7% | **0** |

**★ 陰性対照は通った。** SMUI はアプリケーションだが legacy 0.00% で、
`process_accum` 2.1% = ライブラリ runes 群（1.0〜2.0%）と同じ位置。
**マーカーとタイマーが一致**するので、この分割は「アプリ vs ライブラリ」ではなく
**legacy/runes 軸**を捉えている。

**集計 22.8%** — ただし **huly 単独でコーパス総コンパイル時間の 55.8%** を占めるので、
これは**コーパスの組み方についての主張**。huly を除いても 23.3% なので 1 repo に脆くはないが、
4 repo は 4 repo。**アプリ Svelte 一般の代表性は未測定。**

**★ 「~16%」は確認されていない。★** 実測は 22.8%（集計）/ 22.5〜30.2%（legacy 3 repo）で、
16% ではない。しかも旧 16% は「`script_text` から `ast_transforms` を除いた集合」を指しており
`process_accum` 単独とは**別の量**。したがってこれは
「予言が当たった」のでも「16% が導出された」のでもなく、**初めて直接測った**というだけ。
**旧 16% には信頼できる出所がない**（スキャナのシェアとして渡されたが実際は外側の囲いの値だった）。
数値の一致・不一致にかかわらず、**旧 16% を引用しないこと。**

**`line_scan` はアプリでも 1.1〜1.7%。** 文字スキャナは全母集団で一貫して小さい —
正しさの作業であって時間の作業ではない、という結論は母集団を変えても動かない。

#### ★★ `process_accum` の 3 分割（アプリ母集団）— 「runes vs legacy」の 2 分割ではない ★★

`compile_profile.rs` の `pa_rest` は `process_accumulated − runes_xform − reactive_stmt` の**残差**。
つまりこのバケツは **3 分割**であり、「rune 側か `$:` 側か」の 2 択ではない。実測（total 比）:

| repo | process_accum | runes_xform | reactive_stmt | **pa_rest** |
|---|---|---|---|---|
| **SMUI**（陰性対照） | 2.0% | 0.3% | **0.00%** | 1.7% |
| carbon/src | 30.3% | 0.1% | 13.4% | **16.8%** |
| open-webui/src | 26.3% | 0.1% | 3.8% | **22.4%** |
| huly/plugins | 22.6% | 0.1% | 8.6% | **14.0%** |
| **集計** | **23.0%** | **0.08%** | **7.0%** | **15.9%** |

バケツ内訳: `runes_xform` **0.3%** / `reactive_stmt` **30.6%** / `pa_rest` **69.1%**。

**★ 陰性対照を**先に**読んだ: SMUI の `reactive_stmt` は厳密に 0.00ms。★**
**この順序が本質。** 対照が 0 でなければカウンタは名前どおりのものを測っておらず、
**他の 3 行は読む価値がない**。本セッションで起きた 4 件の計測失敗
（`$:` マーカー / scan カウンタ / `line_loop` の囲い / warmup 混入）は
**いずれも「対照を先に読む」で捕まえられた**。表を読む前に対照を読むこと。

**判明したこと 3 点:**
1. **★ 最重要は「無い」という結果 ★ `runes_xform` は 0.08%（バケツの 0.3%）。**
   SMUI（純 runes・アプリ）の `process_accum` **全体が 2.0%**。
   → **「runes 側に未着手の ~10% が眠っている」という仮説は棄却された。**
   これは**先送りではなく決着**。多数派母集団（runes）にこのバケツの余地は無いので、
   **runes 側をこれ以上掘らないこと**。空である事実の確定は、開いたままの見込みより価値が高い
   （読み手には地味に見えるので、明示的にそう書いておく）。
2. **しかし `reactive_stmt` も支配的ではない**（バケツの 30.6%）。多数派は **`pa_rest` 69.1%**。
3. `pa_rest` は **`$:` 仕事でも rune 仕事でもない** — 文ごとチェーンの残り
   （store 変換 / state read / prop 変換 / legacy 宣言 / member mutation）。

**★ `pa_rest` の legacy 帰属は `[S]` structural argument であって `[D]` ではない ★**

上記ステージはほぼ全て `!analysis.runes` ゲート付き（`client/mod.rs` の各 `stage(...)` 呼び出し）
なので legacy 仕事の**はず**。しかし **SMUI（純 runes）でも `pa_rest` は 1.7% 出ている**。
**自分の陰性対照に 1.7 ポイント分だけ反証されている構造的論証**は、まさに構造的論証であって
計測ではない。よって **「23.0% は全部 legacy」とは言えない**。

**★ 既存の計器はこれに答えない（次の人が「タイマはもうある」と誤解しないために）★**
`stage()` ラッパ（`client/mod.rs`）と `measure-stmt-chain` feature は既にあるが、
`crate::measure_stmt_chain::record(name, before, &out)` は**ポインタ比較で
「そのステージが書き換えたか否か」を記録するだけで、所要時間を測らない**。
→ **`pa_rest` を legacy/runes に分解したい人は、ステージ別の Duration タイマを新規に入れること。**
`gate-coverage.md` の証拠分類でいう **structural argument**（discriminating case ではない）。

**正直な見出し（2 つの数値と、ラベル付きの欠落）:**
> **アプリ母集団のコンパイル時間の ~23%。うち ~2 ポイントは純 runes でも到達する。
> 残りはコード構造上 legacy ゲート付きだが、そのようには計測されていない `[S]`。**

**→ 性能ゲートの母集団ずれについては [`compatibility/GATES.md#gate-coverage`](../compatibility/GATES.md#gate-coverage) を見ること。**
CodSpeed のフィクスチャは 9 個中 8 個が runes、ライブラリコーパスは legacy 12.34%（バイト）、
アプリは 68.89%。**我々の性能計測器は全て 1〜2% の端を向いている。**

**そして、この数値が縮んでも正しさの論拠は 1 ミリも動かない。**
コメントがコードとして読まれる欠陥（#2351 / #2347 / #2590 / #2599）は、
その機構が**何ミリ秒かかるかに依存しない**。perf の数値が小さいことを
「欠陥を残す理由」に読み替えないこと — 別々の 2 つの根拠であり、片方の縮小は他方に影響しない。

**壁時計はこの箱では使えない。** 同一バイナリ・同一入力の 2 回の実行で `line_scan` が 2.08ms と
26.84ms（13x）。`compile_profile` の `COUNTERS` 行（負荷非依存）で判定すること。

**カウンタは「仕事が消えた」ことしか証明しない — 「速くなった」は別の計測。** 姉妹エージェントは
carbon で 951 回のパースを（呼び出し回数で検証のうえ）削除し、huly で **+4.19% 遅く**なった。
本節の 2 つの変更（#2611 / #2612）の上限はカウンタから ~0.09% と dev の ≤0.44% で、
いずれも**配置効果の床 ~5% の 2 桁下**。したがって A/B では原理的に有意な値が返らない。
**この 2 つを `perf(` として扱わないこと**（実際 `refactor(` / `fix(` に改題済み）。

### `collect_vars` の職務

**群 A — analysis のみを読む（テキスト走査ゼロ）**: `state_vars` / `var_state_vars` / `rest_prop_vars` /
`non_reactive_state_vars` / `raw_state_vars` / `store_sub_vars` / `import_names` / `exported_names` /
`prop_source_vars` / `prop_assignment_transform_vars` / `prop_invalidate_bodies` /
`non_bindable_prop_vars` / `read_only_props` / `legacy_state_vars` / `prop_mutation_vars` /
`reactive_mut_binding_names` / `name_occurrences` / `names_all_non_proxy` / `non_proxy_vars` /
`reassign_non_proxy_vars`。**AST 化の対象ではない**（すでに binding ベース）。コストは `String` の
複製であって走査ではない。

**群 B — スクリプト全体を舐める 6 パス**（`COUNTERS` の `collect_scan`）:

| # | 呼び出し | 職務 | AST 化 |
|---|---|---|---|
| B1 | `text_retain_matching_identifiers` | 出現しない state 名を落とす | 純粋な最適化。出力に影響しない |
| B2 | `extract_local_reactive_vars` | ネスト内 `let/const/var x = $state(...)` の収集 | **可**。しかも `is_inside_function_with_param` という手書きスコープ近似より正確 |
| B3 | `index_const_state_decls` | `const x = $state(` の索引 | B2 に融合可。**判別計測でゲート**（下記） |
| B4 | `index_reassigned_vars` | 書き込まれる識別子の索引 | **判別計測でゲート**（下記） |
| B5 | `extract_proxy_vars` | `$state({…})` / `$state([…])` の収集 | 可 |
| B6 | `has_legacy_export_let` | `export let ` 行の有無 | **判別計測でゲート**（下記） |

走査量は実測でソース総量の約 1.85x（flowbite: 2.02MB のソースに対し 3.74MB / 4574 パス）。

#### ★ B3 / B4 / B6 は「不可能」ではない — 「判別計測でゲートされている」★

**この 3 つは "blocked" ではない。次の 1 つの計測を通せば移せる。**
「移せない」と読まないこと。

**共通の性質: この 3 つは文字列リテラルとコメントの中身もコードとして見ている。**
`index_const_state_decls` の doc コメントは、置換元の `contains` が素の部分文字列だったため
`aconst x = $state(` にも当たることを**意図的に保存している**と明記している。`aconst x` は JS として
不正なので、実コードでは**文字列/コメント内にしか現れない**。AST はそこを見ない。

| # | AST 版と食い違いうる具体的な入力 |
|---|---|
| B3 | 文字列/コメント中の `const x = $state(`、および `aconst x = $state(` の形 |
| B4 | コメント中の `x = 1` を「再代入」と数える |
| B6 | テンプレートリテラル/コメント中の `export let ` |

**ゲートとなる計測（1 回で 3 つとも片付く）**: 両実装を同時に走らせ、**答えが食い違った件数を
実コーパス 14,132 エントリで数える**。`profile.rs` の `index_oracle`（`record_index_oracle`）が
まさにこの形の既存プローブなので、同じ枠を使えばよい。

- **0 件なら 3 つとも移せる。** バイト同一が実測で保証される。
- **1 件でも出たら、その差分は「AST が正しく、テキストがバグ」である。**
  文字列やコメントの中身は JS のコードではないので、それを宣言・再代入・エクスポートとして
  数えている側が誤り。**この場合でも移送を諦めるのではなく、バグ修正として別 PR に切り出す。**
  出力が変わるので ratchet の更新が要る（かつ、その entry が今 ratchet で緑になっている可能性がある）。

**やってはいけないこと: 「一致するはず」で移すこと。** 上の計測をせずに移すと、
差が出る入力でだけ静かに壊れ、コーパスが飽和している（= known-failures が空、下記）ため
**その回帰は誰にも見えない**。

### `line_loop` の職務

| # | 職務 | 群 |
|---|---|---|
| L1 | `script_rest.lines()` を `Vec<&str>` に | 分割 |
| L2 | 空行のスキップ / 蓄積 | **整形保存** |
| L3 | 境界での `import` / `export {…}` / `$props.id()` 行のスキップ | 分割 |
| L4 | `update_expression_depths`（paren/bracket/brace/string/block-comment/template-interp） | 分割 |
| L5 | `is_expression_incomplete` | 分割 |
| L6a | 変数宣言の末尾カンマ継続 | 分割 |
| L6b | 末尾演算子継続（`=` `&&` `\|\|` `=>` `?` `+`、行コメント除去後） | 分割 |
| L6c | 波括弧なし制御ヘッダ（`if (…)` / `else` / `do` …） | 分割 |
| L6d | 次の非空行が `.` `?` `:` `&&` `\|\|` `??` で始まるかの先読み | 分割 |
| L7 | runes fast path（文をそのまま出力） | **整形保存** |
| L8 | `process_accumulated`（文ごとの変換チェーン） | 別工程 |
| L9 | 文ごとの深さカウンタのリセット | 分割 |

**L1・L3〜L6・L9 は合計して 1 つの職務しかしていない: 「スクリプトをトップレベル文に切る」。**
それは `Program.body` そのもの。**この群に原理的な阻害性質はない** — `&source[stmt.span]` は
元テキストそのものなので、L2/L7 の「触っていない領域の整形を保つ」性質も span スライスで保てる。

**★ ただし span 分割だけでは足りない、具体的な阻害性質が 2 つある ★**

1. **文と文の間のテキストは `Program.body` のどの span にも入らない。** 現状の挙動は非対称で、
   - 境界の**空行は捨てられる**（L2: `accumulated_lines.is_empty()` のとき push しない）
   - 境界の**コメント行は 1 個の擬似「文」として蓄積され、`process_accumulated` を通る**

   後者が効いている: コメント行は `transform_client_runes_with_skip_and_state` 以下を通るので、
   **コメント中の `$state` などが変換されうる**。これは #2351 / #2347 と同じ「コメントが
   コード扱いされる」欠陥クラスそのもの。素朴に `source[stmt.span]` を並べるとコメントは
   **消える**（oxc では leading trivia）。`source[prev_end..stmt.end]` にすればコメントは残るが
   今度は境界の空行も残ってしまい、出力が変わる。
   → **移行時はこの 2 つを分けて扱う必要がある。ここが設計上の crux。**

2. **`process_accumulated` はテキスト入出力なので、切り出した文の「元テキスト」が要る。**
   span 分割はこれを満たす（むしろ join より安い）が、**チェーン側を先に AST 化しない限り
   ループを AST 化しても再パースは減らない**。実際 `process_accumulated` の各 AST 化済み段
   （`state_assigns_combined_ast` / `prop_source_reads_ast` / `read_only_props_ast` /
   `console_dev_ast` …）は**文ごとに 1 回ずつ再パースする**。dev エージェント計測の
   「`reparse/f` がファイルサイズとともに増える（prod 0.05→0.82x, dev 0.39→2.58x）」はこれで説明できる。
   **件数は超線形、時間シェアは 3-4%。両方正しく、別の問いに答えている。**

### ★ コーパスは飽和している — このゲートは非 JS 出力について**何も言わない** ★

2026-08-08 実測（14,132 エントリ × 3 ターゲット、`verify.mjs`）:

```
match 13184 / error-parity 948 / js-mismatch 0 / js-unparseable 0 / css-mismatch 0
output parseability: 14,132 match, 0 unparseable; 39,551 モジュール全てパース可
```

そして `known-failures.{client,server,client-dev}.json` と
`parse-known-failures.{client,client-dev}.json` は **5 本とも 3 バイト = `[]`**。

**したがって「非 JS を出す ~24 コンポーネントはコーパスに known-failure として
抱えられているので、同じ誤ったバイトを再現しても緑のままだ」という懸念は当たらない。**
隠れる先の known-failure が 1 件も存在しない。正しい言明は次のとおり:

> **その ~24 はこのコーパスに**入っていない**。よってこのゲートは、それらが直ったとも
> 直っていないとも言わない — 両方向に沈黙している。**

探しに行く人は、ratchet 付きコーパスではなく別の母集団（実出荷リポジトリ、
`corpus:mutate` の変異ファズ）を見ること。**「コーパスが隠している」と
「コーパスに入っていない」は別の主張で、探す場所が変わる。**

### 着手順（この順に、1 段ずつバイト同一で）

1. ✅ 計測器: 負荷非依存カウンタ（`COUNTERS` 行）。**先にこれ。壁時計では判定できない。**
2. ✅ L6c の遅延化 + 末尾行だけで答える（#2611）
3. ✅ dev で runes fast path を復活（#2612）
4. B1/B2/B5 の融合または AST 化（B3/B4/B6 は上記の**判別計測を先に通してから**）
5. L1〜L6 を `Program.body` の span 分割に置換（crux は「文間テキスト」の 2 つの非対称性）
   — **これは正しさの作業**。時間は出ない。
6. `process_accumulated` の段ごと再パースの解消 — **時間があるのはここだけ**

**2〜5 をやっても ~16% は回収できない**（上の「帰属替え」節）。6 が本体。

---

## 00. 改訂（2026-08-01）: サーバ完了・クライアント着手 — **まずここを読むこと**

以下 §0 以降は 2026-06 時点の記録で、**歴史的経緯としては有効だが現状とは異なる**。差分は次のとおり。

### 何が終わったか
- **サーバ SSR は完了・出荷済み**。`3_transform/server/` は 35 ファイル 36,299 行の純 AST パイプラインで、
  旧テキスト生成器は削除済み（AGENTS.md 記載）。§7 の Step 1〜4 は決着している。
- したがって本ドキュメントの残タスクは **§7 Step 5「client: js_ast `Raw` 全廃 → `to_oxc` 経由に一本化 →
  `codegen.rs` 削除」** ただ 1 つ。これが現行タスク #15。

### 失効した制約
- 「**oxc 0.136 に `VisitMut`/`oxc_traverse` は無い → 手書き `&mut` 再帰下降しかない**」（§核心メカニズム）は
  **失効**。現行 oxc（rev `65fe65d8`）は `VisitMut` を提供し、完成したサーバ実装が実際に使っている
  （`server/ast/read_wrap.rs`、`server/ast/mod.rs` の TS strip）。クライアント側も `VisitMut` で書いてよい。

### 追加で確定した計測事実（2026-07〜08、samply + 統制実験）
- **Step 5 の実体は「codegen.rs を消す」ではない。** `parse_chunk` が再パースするテキストの内訳は
  **script 本体 79.8% / import 15.9% / 小片 4.4%**。79.8% は `transform_instance_script_for_visitors` が返す
  テキストなので、**client script 変換自体を AST 化しない限り消えない**。
- **`parse_chunk` は per-byte 支配で、per-call 固定費は無視できる。** import を 1 チャンクに統合して
  呼び出しを 44% 減らしてもバイト数が同じなら時間は動かなかった（21 ペア、t=0.96）。
  → **チャンクの切り方・統合・分割は全て無駄。バイトを消す以外に手はない。**
- **`JsExpr` に `Parenthesized` バリアントが無い。** oxc は `preserve_parens` で `ParenthesizedExpression` を
  作るので、IR を経由する限り括弧情報が落ちる。IR 廃止で消える問題だが、**移行途中に「IR 経由」と
  「oxc 直行」が混在すると括弧差が出る**。混在期間を作らない設計が要る。
- クライアント側の削除対象規模: `js_ast/codegen.rs` 3,565 行、`client/mod.rs` 6,679 行、
  `client/ast_state_transform.rs` 4,907 行、client 配下の `*_ast.rs`（span splice 系）**36 ファイル**。

### バイト同一制約のコスト（設計判断の前提）
esrap 印字は corpus 25.1µs/file、svelte-rs の `oxc_codegen` は 8.1µs/file（うちソースマップ 2.0µs）。
**公式コンパイラとのバイト同一を守る代償が約 17µs/file** で、これは svelte-rs の総予算 84.9µs の 20%。
この制約は rsvelte の存在意義（drop-in 置換、svelte2tsx/LSP/lint が出力忠実性に依存）なので**堅持する**。
ただし「esrap を維持する」と「esrap を遅いまま維持する」は別で、**esrap 内部の出力不変な最適化は
制約に抵触しない**（印字ループ内の TLS 参照が 1.19% 等、未着手）。

### クライアント移行のマイルストーン（#15）
| M | 内容 | 期待削減 | 撤退条件 |
|---|---|---|---|
| M0 | oracle ハーネス + `client/ast/` スケルトン + 本ドキュメント復活 | 0（インフラ） | なし |
| M1 | client script 変換の単一 AST パス化（`server/ast/script.rs` + `read_wrap.rs` 写経） | −30〜35µs | oracle 差分が 3 連続作業セッションで減少しない、または差分原因が §4 の構造問題（単一パス不能）と特定された場合はブランチ破棄 |
| M2 | テンプレート式変換の単一 AST パス化（`has_reactive_state_json` 550 行の typed 化を吸収） | −20〜25µs | 220 件回帰の再演を検知したら即 revert |
| M3 | `js_ast` IR 廃止（`to_oxc.rs` / `codegen.rs` 削除） | −14µs | テキストプリンタ経路（scriptless）の差分が 3 連続作業セッションで解決しなければ、テキストプリンタだけ残す縮退案へ |
| M4 | esrap 最適化 + `*_ast.rs` 36 ファイル削除 + CI ガード | −10〜13µs | バイト差が出たら即 revert |

**M0 を飛ばして M1 に入ることは禁止**（§5 の「220 件回帰 ×2」を再演するため）。

### ★ M1 再開（2026-08-02、ユーザー指示）— 保留は解除された ★

以下の「保留中」節は**歴史的経緯**として残す。現状は再開済みで、判断が 3 つ変わっている。

**1. `innermost_only` のネスト解決は設計項目ごと消滅した。** 保留時に「M1 で唯一設計が固まって
いない、200〜400 行の新規設計が要る」と書いたが、これは**編集収集モデルを維持したまま
`&mut Program` に載せる**前提での見積りだった。実際の置換は

```rust
let outer_text = &self.source[expr.span.start as usize..expr.span.end as usize];
let mutate = format!("$.mutate({}, {})", root_name, outer_text);
```

= **現在のノードのテキストを丸ごと埋め込む wrap**。だから内側が先に確定している必要があり、
`innermost_only` + fixed-point で順序を作っていた。in-place では「部分木を move する」だけなので、
**子を訪問してから親を書き換える（post-order）と合成が自動成立する**。load-bearing 12 本のうち
legacy_state_member_mutate / prop_assign / state_set_reactive / store_assign / reactive_update の
5 本で置換の形を実地確認済み。

**2. `skip_assignment_spans` も同じくテキストモデルの副産物。** 既存版は
`$.mutate(var, <assign>)` の形を検出して内側の代入をスキップすることで、fixed-point の再走査に
対する冪等性を確保していた。in-place では**この走査で作った wrap を再訪しない**ため、
**入力に元から存在する wrap の検出だけ**が残る（他パスが先に `$.mutate` を出している場合）。

**3. 置換は常に部分木から作れるとは限らない。** `legacy_state_member_mutate` の
`invalidate_bodies` は呼び出し元が渡す `FxHashMap<String, String>` の**任意 JS テキスト**で、
現在のプログラムの部分木ではない。**同じ arena にパースしてから move する**必要がある
（既存パターン: `js_ast/to_oxc.rs:1176` の `allocator.alloc_str(text)` → `Parser::new(allocator, …)`）。
このため `with_program_mut` は `&Allocator` も渡す。

#### 移植の形（(2) フェーズ中は本番を切り替えない）

各パスは移植後も **production ではテキスト経路の結果を返す**。`&mut Program` 経路は
`RSVELTE_AST_DUAL_RUN` 下でのみ走り、`dual_run::compare_pass` が両者を突き合わせる。
理由: splice 出力は**触っていない領域の元の整形を保つ**のに対し esrap 印字は全体を再整形するため、
1 本だけ本番切り替えすると中間テキストが変わり下流の `parse_chunk` に波及する。
**最終フリップだけが不可分**という既存の設計判断と一致する。

`compare_pass` は両側を `normalize`（= `esrap(parse(x))`）に 1 回ずつ通す。esrap の整形が相殺され、
パスの挙動差だけが残る。**2 経路は適用順序が違う**（collect-then-splice vs post-order in-place）ので、
順序依存のパスを検出するのがこの比較の役目。**ミスマッチを「順序差だから正当」と説明してはいけない。**

#### 進捗

| | 状態 |
|---|---|
| ドライバ `with_program_mut` + `dual_run::compare_pass` | 完了（`fcf59761`） |
| load-bearing 12 本 | **11 本が移植済み**（2026-08-08 に `command grep -rln with_program_mut` で確認） |

移植済み: `legacy_state_member_mutate` / `prop_assign` / `prop_member_mutate` / `reactive_update` /
`state_assigns_combined` / `state_pipeline` / `state_set_reactive` / `store_assign` /
`store_member_mutate` / `store_unsub_wrap` / `store_update`。

**この表は 2026-08-08 まで「1/12・dual-run 検証中」と書かれていた。** 引き継ぎ文書と実装が食い違う
ときはコードを読むこと（AGENTS.md の「doc は古い、関数を読め」）。なお**残りのパスを移植しても
得られるのは 0.1%** — 額が出るのは融合や移植ではなく**テキスト機構そのものの除去**（§000）。

着手順は**公式フィクスチャの踏み方**に合わせる。`prop_source_reads` は splice 0 の parse-only なので
load-bearing 12 本に入らない（flowbite 基準の module_state_runes 先行案も公式で 0 回なので棄却済み）。

---

### （歴史）M1 は保留中（2026-08-01 決定）

**決定**: client の pure-AST 化（M1〜M3）は**保留**。先に esrap 最適化（M4 相当）と analyze の走査融合を
取り、残ギャップを確定させてから (3) の規模を再交渉する。**中止ではない** — (3) は 1.0x 到達の
最終必須ピースであり、以下の資産はそのために保全してある。

**理由**（すべて実測）:
- (3) の実価値は **13〜17µs/file**。対して esrap 最適化は **10〜13µs** で、**効果は同等・リスクとコストは 1 桁低い**
  （出力不変の内部最適化なので失敗すれば revert するだけ。(3) は 12 本 4,000 行の移植 + 不可分な切り替え）
- **esrap 27.7µs は単一で最大の未着手項目**。perf-loop の「上位から攻める」に反して後回しにしていた
- 逆転（svelte-rs 84.9µs 未満）の必須条件は **analyze が svelte-rs の 36.3µs を下回ること**。
  そこを先に確定させたほうが (3) への投資判断の精度が上がる

**再開条件**: esrap 最適化と analyze 融合の完了後、残ギャップを再測して (3) の規模を再交渉する。

**再開時に最初に解くべき未設計課題**: `innermost_only` のネスト編集解決。現状は「テキストに書き戻して
再パースする」ことで暗黙に成立しているが、`&mut Program` 化するとその正規化が消える。12 本すべてに
触る横断変更で 200〜400 行の新規設計が要る。**ここが M1 で唯一設計が固まっていない部分。**

**保全済みの資産**（ブランチ `feat/client-ast-m1`、main 直上）:
- `RSVELTE_AST_DUAL_RUN` ハーネス（`shared/ast_rewrite.rs`）— パス別の再パース数 / splice 数 /
  esrap 正規化の冪等性を計測。未設定時はオーバーヘッドゼロ、production 出力は不変
- 本ドキュメントの計測記録（下記）。**再開する人は計測をやり直す必要がない**

---

### M1 着手時の調査（2026-08-01）— 見積りが下がる方向の発見

M1 を「`server/ast/script.rs` を写経して意味論を移植し直す」と想定していたが、**client 側の意味論は
すでに AST 形で移植済み**だった。`client/*_ast.rs` は **37 本・13,010 行**あり、**37 本すべてが
`&str -> Option<String>`**、すなわち `shared/ast_rewrite.rs` の
「パース → `Visit` で `(start, end, replacement)` を収集 → ソース文字列に `replace_range`」型である。

つまり M1 で作り直すのは**意味論ではなく配管**:

- 現状: 1 パスごとに「script をパース → 編集を収集 → テキストに戻す」。適用パス数だけ
  **パースとシリアライズを往復**する（`ast_rewrite.rs` のドキュメント自身が
  「Every `transform_*_ast` pass in this directory follows the same shape」と明記）
- M1 後: script を **1 回だけ**パースし、37 本の collector を `VisitMut` で **同じ `Program` に対して
  in-place 適用**、最後に esrap で 1 回印字

これは §4 の「read-wrapping は単一パスでしかできない」とも一致する。既存 collector が持つ判定ロジック
（例: `state_reads_ast.rs` の 14 行の対応表 — `$.get(count)` 済み / `$.set` の第 1 引数 / property key /
shorthand / shadow の各ガード）は**そのまま再利用でき、再導出は不要**。

したがって M1 の risk は「意味論の移植ミス」より「**37 本を 1 つの Program に載せ替える際の適用順序**」に
移る。順序は現在テキストの逐次適用が暗黙に決めているので、**移行時に順序を明示的に固定する**こと。

進め方（更新）:
1. `ast_rewrite.rs` に `with_program_mut`（`&mut Program` を渡す）を足す。既存の splice 版は残す
2. パスを 1 本ずつ `&mut Program` 版に移す。**移行中は「まとめて 1 回の切り替え」制約に抵触しない** —
   各パスは独立で、テキスト経路と AST 経路の出力が同じである限り oracle 差分は 0 のまま
3. 全パスが `&mut Program` になった時点で、初めて「1 回パース → 全パス適用 → 1 回印字」に配管を繋ぐ。
   **この最後の 1 手だけが不可分**

#### client の `*_ast.rs` 台帳（37 本 / 13,010 行、2026-08-01 時点）

**呼び出し元でクラスタ化される** — 各クラスタは独立に `&mut Program` 化できる。行数の大きい順:

| クラスタ（呼び出し元） | パス | 合計行 |
|---|---|---|
| **class_transforms.rs**（private class field 系） | private_class_assign 753 / private_field_assign 414 / private_member_read_wrap 369 / private_v_suffix 368 / private_read_wrap 349 / private_member_mutate_root 266 / effect_rune 224 | 2,743 |
| **mod.rs 直下**（instance script 本体） | state_reads 656 / state_pipeline 615 / read_only_props 482 / console_dev 389 / strict_equals 290 / derived_by 159 / local_assign 207 / strip_rune_generics 194 / module_state_runes 117 | 3,109 |
| **store_transforms.rs** | store_assign 436 / store_member_mutate 381 / store_update 272 | 1,089 |
| **state_transforms.rs** | prop_assign 331 / prop_member_mutate 497 / store_unsub_wrap 300 | 1,128 |
| **reactive_transforms.rs** | state_set_reactive 280 / reactive_update 303 / state_member_mutate 328 | 911 |
| **rune_transforms.rs** | tag_declarator 354 / tag_class_field 641 | 995 |
| **props_transforms.rs** | prop_source_reads 641 / rest_prop_member_access 262 | 903 |
| **module_state_runes_ast.rs** | state_call 300 / state_raw_frozen 290 / state_snapshot 176 | 766 |
| その他 | destructure_transforms 経由 legacy_state_member_mutate 443 / module_dev_tail 179 / ast_state_transform 経由 inspect_rune 194 / 未使用 class_body 59 | 875 |

`transform_instance_script_for_visitors` 本体から直接呼ばれる順序（テキストの逐次適用が現在暗黙に決めている順）:
`state_assigns_combined` → `state_pipeline` → `prop_source_reads` → `read_only_props` → `console_dev` →
`strict_equals` → `inspect_rune`。**移行時はこの順序を明示的に固定すること**（§4 の冪等性問題は順序に依存する）。

移行の着手順（独立性が高い＝安全な順）:
1. **module_state_runes クラスタ**（766 行 / 呼び出し元 1 つ / module script 専用でコンポーネント経路に影響しない）
2. **class_transforms クラスタ**（2,743 行 / private field は他と名前空間が重ならない）
3. store / props / reactive / state の各クラスタ
4. 最後に **mod.rs 直下の 9 本**（`state_reads` を含む＝§4 の本丸）

#### 台帳の更新（2026-08-01 後半）— 実測で 12 本まで絞れた

三つのコーパスで「どのパスが実際に走るか」を計測した（`RSVELTE_AST_DUAL_RUN=1`）。

| コーパス | ファイル | 再パース | splice |
|---|---|---|---|
| flowbite（実アプリ・runes） | 1,296 | 120（0.09/file） | 13 |
| **公式 Svelte フィクスチャ** | 4,459 | 4,470（1.0/file） | **397** |
| compatibility/pattern-corpus | 79 | 6 | 0 |

**flowbite だけを見て範囲を決めてはいけない。** flowbite は runes のみで legacy `$:` / store /
props をほぼ踏まないため 3 本しか動かないが、**バイト同一ゲートである公式フィクスチャは 22 本を起動する**。

**parse と splice を区別すること。** parse だけのパスは「変更なし」と判断できればよく、(3) の配管時に
`None` を返してフォールバックさせられる。**実際に編集を出す 12 本だけが load-bearing**:

```
state_assigns_combined 152 / prop_assign 83 / state_set_reactive 35
legacy_state_member_mutate 26 / store_assign 19 / store_unsub_wrap 16
prop_member_mutate 10 / reactive_update 10 / state_pipeline 8
store_update 7 / store_member_mutate 7 / private_class_assign 1
```
→ 移植対象は **37 本 13,010 行 → 12 本 約 4,000 行**。着手順は公式フィクスチャの踏み方に合わせ
legacy / props / store クラスタから（flowbite 基準の module_state_runes 先行案は公式で 0 回なので棄却）。

`state_reads_ast` は 844 parses で splice 0。編集が `ast_state_transform` の統合パスに吸収されている
と見られる。**(3) の設計時に吸収先を確認すること。**

esrap 正規化の冪等性は 3 コーパス通算 410 件の splice 出力すべてで成立（ミスマッチ 0）。

#### (3) の実価値（2026-08-01、マージ済み main・静穏環境で再測）

```
TOTAL 200.69µs/file        script_text 27.76 / js_codegen 39.55 / template_fragment 37.82
transform_instance_script_for_visitors  inclusive 30.9µs / self 3.7µs
Cx::parse_chunk                         inclusive  7.5µs（うち script 本体 79.8% ≈ 6.0µs）
```

**(3) が消せるのは 13〜17µs**（parse_chunk の script 分 6.0 + to_oxc の script 分 3〜4 +
テキスト生成/splice 往復 3〜5 + script-text 自時間の文字列処理 1〜2）。

**(3) では消えない**: AST 変換本体（rune lowering・read wrapping・代入 lowering）は表現が変わるだけで
仕事量は同じ。esrap 印字 27.7µs は M4、Phase1/2 のパース 8.1µs は正当なパース。

**追加リスク**: `innermost_only` のネスト編集解決は現在「テキストに書き戻して再パース」で成立している。
AST 化するとその正規化が消えるため自前で持つ必要があり、12 本すべてに触る横断変更で 200〜400 行の
新規設計を要する。**M1 で最も設計が固まっていない部分。**




撤退条件を暦日でなく**作業セッション数**で数えるのは、この作業がエージェントのセッション単位で進み、
実時間の経過が進捗と対応しないため。1 セッション = oracle 差分を 1 回以上測って記録した単位とする。

---

## 0. 現在の状態（2026-06-19 時点）

- **main**: `99725cca fix(ssr): burn output-equality corpus + esrap-faithful SSR codegen (#1092)` がマージ済み。
  これにより **コーパス既知失敗 248 → 120 件（128件解消、約52%）**、全CIグリーン。
- **作業ブランチ**: `feat/phase3-ast-refactor`（origin/main から作成、リモートに push 済み）。
  現状このブランチには計画ドキュメント更新コミット1個（`docs(refactor): record single-pass-AST requirement…`）のみ。
- **ワークツリー**: `/Users/baseballyama/git/rsvelte-ssr-esrap`（origin/main の worktree。ユーザー指示によりワークツリーで作業）。
- 残コーパス失敗は `compat/corpus/known-failures.json`（120件）。CI ラチェットは縮小のみ許可。

### 進捗ログ
- **2026-06-19 PR #1097（Step 1+3 開始: client `js_ast` の Raw 削減、コーパス 120 据え置き）**:
  ユーザー判断で「大物の Step 1+3」を開始。**調査で判明した地形（重要）**:
  - **サーバ codegen は既に `rsvelte_esrap::print` 経由**（`server/build.rs::normalize_script_with_oxc`、
    oxc parse → esrap print）。残る `$$C$$` hex コメント密輸 + `decode_in_call_comment_placeholders` と
    `esrap_layout.rs` の reflow が Step 1（コメントストリーム）で消す対象。
  - **client codegen は手書き `js_ast::codegen::generate`（codegen.rs 3305行）**＝Step 3 の本丸。
    `js_ast` IR に `Raw(String)` エスケープが **~198箇所**。多い順: `server/bridge.rs`(49, SSR markers),
    `client/.../expression_converter.rs`(46, JSON-AST→JsExpr の fallback), `server/build.rs`(25),
    `client/.../bind_directive.rs`(15), `client/mod.rs`(11), `client/.../shared/utils.rs`(10)。
  - **常時グリーンな漸進戦略**: client の `Raw(...)` を、codegen が既に扱う**構造化 JsExpr/JsStatement variant**へ
    置換して surface を縮小 → 最終的に client を oxc AST + esrap に big-bang 切替（esrap 出力＝公式と一致するので
    フィクスチャは合うはず、ただし要全フィクスチャ検証）。**注意**: `Raw` のうち「リテラルの逐語保存」
    （`expression_converter.rs` の二重引用符文字列 217 / 特殊数値 237 / bigint 251）は **テキスト処理ではなくトークン保存**で
    良性、優先度低。本当に潰すべきは文字列**構築/連結**型 Raw（import.meta の `format!`、SSR bridge の文字列組立等）。
  - **着地済みスライス（2件、leaf node）**: `JsExpr::Super`（`Raw("super")` 駆逐）と
    `JsExpr::MetaProperty(meta, property)`（`Raw(format!("{}.{}", …))`＝import.meta 駆逐）。各々コーパス 120 据え置き・
    build/clippy/fmt clean・CI（前者）green。**新 variant 追加手順（必須・実証済み）**: nodes.rs enum +
    codegen.rs arm + 網羅 match 群に leaf として追加（`has_await_expression_arena`,
    `apply_transforms_to_expression_with_shadowed` の `=> expr.clone()` 群,
    `collect_reactive_references_inner` の terminal 群）。`cargo check -p rsvelte_core` が未カバー match を全列挙するので
    それを潰す（leaf は This/Super と同じ群へ）。1スライス＝napi build(~2m40s)+corpus(~13s)+clippy。
  - **着地済み追加（sub-expression を持つ node の手本）**: `JsExpr::ImportExpression{source, options}` で
    dynamic `import(...)` を構造化。**重要な手本**: 旧 Raw は変換時に `generate_expr` で source/options を**先食い文字列化**して
    凍結＝後段の解析パスから不可視だった。これをバイト一致で再現するため、新 node は sub-ExprId を持つが
    **解析3パスでは terminal 扱い**（has_await/apply_transforms/collect_reactive の Raw と同じ群に追加、再変換しない）、
    codegen のみが lazy に emit。codegen の優先順位 `matches!` 述語は **import() は call 同様 atomic なので変更不要**
    （Call が載っていない＝括弧不要のデフォルト）。これで `generate_expr` 先食い（真のテキスト生成）を除去。
    検証: コーパス 120 据え置き・build/clippy/fmt clean。
  - **leaf Raw は概ね枯れた**。残る client Raw は **sub-expression を持つ**ため leaf 追加より surface が大きい:
    dynamic `import(source, options)`（現状 `generate_expr` で source/options を**先食い文字列化**＝真に潰すべき
    テキスト生成。`ImportExpression{source:ExprId, options:Option<ExprId>}` 化には has_await/apply_transforms/
    collect_reactive **に加え codegen の演算子優先順位/括弧付け group 群**(codegen.rs 962/1263/1299/1329/1602)へも
    正しく追加要), 分割代入 LHS パターン(`pattern_to_string`), `bind_directive.rs`(15, 手書き arrow)。
    `expression_converter.rs` の「Unknown」fallback(1851/1856/1866)や literal 逐語保存(217/237/251)は良性で対象外。
    → これらは**集中した専用作業**向き（session 終盤の細切れ grinding より、まとめて慎重に）。
  - **★★ 決定的知見（2026-06-19 実験、big-bang を大幅 de-risk）★★**: client の最終出力（`js_ast::codegen::generate`
    の文字列）を **oxc parse → `rsvelte_esrap::print` で再印字**する実験的ポストパスを入れて全 byte-exact suite を測定:
    **`runtime` 19/19・`compiler_fixtures` 17/17・コーパス 120（NEW 0）すべてバイト一致でパス**（コメント込み）。
    → **手書き client codegen の出力は、それを再パースして esrap 印字したものと完全にバイト一致**＝
    codegen は既に esrap を完璧に模倣している。重要な含意:
    1. **direct-AST 版 Step 3（client visitor が oxc AST を直接構築 → esrap 印字）は一致出力を出すと実証済み**
       （esrap がターゲットで、codegen が既に esrap と一致するため）。big-bang のリスクは出力一致ではなく**実装量**のみ。
    2. **コメント位置はクライアントでは問題にならない**（再パース+esrap でも全フィクスチャ一致）。Step 1（コメントストリーム）は
       サーバの `$$C$$` 除去には要るが、クライアント big-bang のブロッカーではない。
    実験はコミットせず revert 済み（理由: ポストパスは codegen を**消さず** esrap を上乗せするだけ＝テキスト処理は残り、
    かつ parse+print 二度手間の **perf 退行**。handoff §non-goals の「perf 退行は profile してから」に反する）。
    **次セッションの推奨**: この実証を踏まえ、**direct-AST 版 Step 3**（codegen を消して oxc AST 直接構築）を本命として進める。
    検証は `pnpm run generate-fixtures` 後に `cargo test --release --test runtime --test compiler_fixtures`（byte-exact gate）。
    なお `cargo test` のターゲット名は `runtime` / `compiler_fixtures` / `compiler_err` 等（`snapshot`/`ssr` という単一ターゲットは無い。
    ssr は `ssr_*` 個別ファイル）。`svelte_check` bin が時々リンク失敗（既知 flaky）。
  - **★ direct-AST Step 3 の土台着地（PR #1097, flag-gated・byte-exact 検証済み）★**:
    新モジュール `js_ast/to_oxc.rs` の `program_to_oxc(&JsProgram, &JsArena, &Allocator) -> Option<Program>`＝
    client `js_ast` IR を **oxc `AstBuilder` で oxc `Program` に直接構築** → `rsvelte_esrap::print` で印字
    （codegen を介さない真の direct-AST）。**安全機構**: 未対応 variant / `Raw` / `Spanned` で `None` を返し、
    呼び出し側（client/mod.rs）は codegen にフォールバック＝部分対応でも常に正しい。`RSVELTE_CLIENT_TO_OXC` env flag で
    gate（**既定 OFF**＝コミット状態は無変更でグリーン）。**flag ON で byte-exact 検証済み: runtime 19/19・
    compiler_fixtures 17/17 パス**（フィクスチャ内の全 structured client program で codegen とバイト一致を実証）。
    対応済み: 大半の式（identifier/literal/this/super/meta-property/member/call/new/binary/logical/unary/conditional/
    sequence/array/object/spread/await/void/arrow/**template-literal/tagged-template/assignment(識別子+非optional member)/update**）
    + 一般的な文（expression/return/var-decl(識別子のみ)/block/empty/debugger/throw/break/continue/if）。
    **対応拡大（burn-down 4スライス着地・各々 flag-ON byte-exact green）**: + assignment/update/template-literal/
    tagged-template + function-expr/chain/import-expr/regex + **import/export/function-decl 文**（実コンポーネント解放）
    + **制御フロー文 for/for-of/for-in/for-await/while/do-while/switch/labeled/try**。
    **さらに着地（burn-down 計6スライス、各々 flag-ON byte-exact green）**: + **分割代入 binding pattern**
    （object/array/rest/default/hole/nested、var-decl/params/for-of/catch、共有 `binding_pattern` helper）
    + **yield / private-field member(`obj.#x`) / object property の method/getter/setter/computed**
    （codegen の `auto_method` 規則を再現）。
    **+ Class（メソッド/フィールド/computed key/super、static-block と decorator は bail）+ assignment-target 分割代入**
    （`[a,b]=x` / `{a}=x`、IR は Array/Object 式を pattern 位置で再利用、oxc `Array/ObjectAssignmentTarget` 構築）。
    **→ converter は variant-complete。全 JS 構文を byte-identical に変換可能。残る bail は `Raw`/`Spanned`/`RawMapped`（不透明テキスト）のみ。**
    各スライスは subagent に `to_oxc.rs` の variant 追加を委譲 → メインが diff レビュー + 中央 byte-exact 検証
    （`RSVELTE_CLIENT_TO_OXC=1 cargo test --release --test runtime --test compiler_fixtures`、flaky bin はリトライループ）→ commit。
    **Raw-elimination フェーズ開始済み**（client Raw 59→56）: 第1スライスで `expression_converter.rs` の
    リテラル逐語保存 Raw 3個（二重引用符文字列・非正規数値 `1_000_000` 等）を構造化
    `JsLiteral::RawString{value,raw}` / `RawNumber{value,raw}`（codegen は raw 逐語出力＝旧 Raw とバイト一致、
    to_oxc は oxc literal の raw 経由）に置換。**★Raw-elim スライスの検証は二重★**: IR + codegen を触るので
    **flag-OFF（codegen 不変＝コーパス 120 no-NEW + byte-exact fixtures）と flag-ON（to_oxc が新ノードを処理）の両方**を検証する
    （to_oxc-only スライスは flag-ON だけで済んだが、Raw-elim は codegen も変えるため flag-OFF も必須）。
    残 client Raw クラスタ（構築箇所、~56）と**精査済みの性質（重要：mechanical ではない）**:
    - **`declarations.rs`(2) / `program.rs`(2)＝load-bearing opacity**: `JsExpr::Identifier(name) => JsExpr::Raw(name)`。
      これは setter callee を `apply_transforms_to_expression` の prop-read 変換（`x→x()`）から**不可視にする意図**
      （コメント明記。Identifier に戻すと `x(value)`→`x()(value)` に二重変換し回帰）。構造化するには
      **`apply_transforms` がスキップする「不変 Identifier」**を導入する（例: `JsExpr` に opaque-identifier 概念追加、
      apply_transforms で Raw 同様スキップ、codegen/to_oxc は Identifier として扱う）。IR 追加＋apply_transforms/codegen/to_oxc 4点。
    - **`const_tag.rs`(2) / `declaration_tag.rs`(3)＝文字列組立の文**: `Raw(format!("const {} = {};", pattern_str, init_str))`,
      `Raw(rhs)` 等。pattern_str/init_str/rhs を**構造化（JsStatement::VariableDeclaration / 構造化 init）**するには
      上流の文字列生成を構造化ノードに置換要。
    - **`shared/component.rs`(4) / `bind_directive.rs`(14)＝手書き arrow getter/setter（最難）**: 本体が文字列。
      `JsExpr::Arrow` + 構造化 body に分解。setter_body/getter 文字列の生成元から構造化が必要。
    - **`shared/utils.rs`(3)**: `Raw(collection_expr)`（each コレクション式の生テキスト）等＝任意式テキスト。
    - **`mod.rs`(11) / `await_block.rs`(4)**: 未精査。比較的 mechanical なものがあるか次セッションで grep 精査。
    - **`expression_converter.rs`(残11)**: 多くは `/* Unknown */`/`/* Array */`/ChainExpression-missing 等の**到達しない fallback**
      ＝リアルプログラムを塞がない（converter が bail しても実害なし）→優先度最低。`pattern_to_string`(2) は分割代入を式位置で
      文字列化＝to_oxc の pattern 処理を流用して構造化可能。
    **★★ 重要な構造的発見（全体像）★★**: `mod.rs` の Raw/RawMapped の大半は **instance/module script 変換結果
    （`transform_script.rs` の テキストパイプライン出力）を不透明テキストとして IR に運ぶ境界** + 先頭コメント
    （`/* … generated by Svelte */`）。`await_block.rs`/template 由来の Raw もテンプレート式テキストの境界。
    **つまり残 client Raw の多くは「個別に構造化」できず、その INPUT を生む 2 つの大仕事に律速される**:
    - **Step 2: script 変換の AST 化**（`transform_script.rs` の store/remove_rune/class_fields 等の残テキストパス。
      session 序盤で derived read/update/assignment/thunk は AST 化済みだが、残りは未。これが終わるまで mod.rs の
      script-block Raw は消せない）。これは Step 3 と並ぶもう一つの multi-week 本丸。
    - **コメントストリーム**（先頭コメント等。`Root.comments` → `print_with_hooks`）。
    → **to_oxc 出力 converter（Step 3）は完成したが、その入力（script 変換・テンプレート式）はまだテキスト**。
    「flag を ON にして codegen 削除」の最終ゴールには **Step 2 完了 + コメントストリーム**が必須。
    **当面構造化できる残 Raw（Step 2 非依存）**: output-IR 構築の文字列組立（bind_directive/component の getter/setter arrow、
    const_tag/declaration_tag の宣言文）。これらは upstream の文字列生成を構造化ノードに置換すれば消せる（intricate, 1クラスタずつ dual 検証）。
    **総括**: literal-spelling/opaque-ident（済）以外の残 Raw は (a) 文字列組立 output-IR（構造化可、intricate）か
    (b) script/template テキスト境界（Step 2/コメントに律速）。mechanical な一括処理は不可。
    **次フェーズ（flag を ON にする前の本丸）**: (a) Class + assignment-target 分割代入は**追加済み**、(b) **client visitor が生成する
    ~191 個の `Raw(...)` を構造化ノードに置換**（structured な式/文を Raw 文字列で組み立てている箇所＝
    bind_directive.rs の手書き arrow、bridge.rs の SSR テンプレ等。これが減るほど converter が `None` で codegen に
    fallback せず direct-AST で出せるプログラムが増える）、(c) **コメントストリーム**（Phase-1 `Root.comments` →
    `rsvelte_esrap::print_with_hooks` の `get_leading`/`get_trailing`。現状 converter は synthetic Program でコメント無し＝
    コメント付きプログラムは codegen fallback に頼っている可能性。要 hooks 実装）。(a)(b)(c) が揃ったら
    `RSVELTE_CLIENT_TO_OXC` を**既定 ON** に反転 → `js_ast::codegen`(3305行) と client/formatting 後処理を削除 →
    client がテキスト codegen ゼロ・完全 AST ベースに。
    **次の作業（burn-down）**: bail している variant を1種ずつ `to_oxc.rs` に追加（oxc AstBuilder API は
    `~/.cargo/git/checkouts/oxc-2492aa67f5b41d4f/37a34a1/crates/oxc_ast/src/generated/ast_builder.rs` 参照。
    `NONE` は `oxc_ast::NONE`、文字列は `ab.allocator.alloc_str(s)`、`ab.expression_identifier(SPAN, &str)` 等）。
    各追加ごとに `RSVELTE_CLIENT_TO_OXC=1 cargo test --release --test runtime --test compiler_fixtures`（byte-exact gate。
    ※ `parse_profile`/`svelte_check` bin が時々リンク失敗＝flaky、リトライで通る）。Raw が全廃 + 全 variant 対応 +
    コメントストリーム（Step 1: `print_with_hooks` 経由）が揃ったら flag を**既定 ON** に反転 → codegen 削除。
    template-literal は IR の cooked/raw を oxc TemplateElement に、assignment/update は演算子マップ追加でほぼ機械的。
  - **最終的な本丸**: client を `js_ast::codegen` から「oxc AST 構築 + `rsvelte_esrap::print`」へ big-bang 切替
    （esrap 出力＝公式コンパイラ準拠なのでフィクスチャは原理上一致するはずだが、**全 byte-exact フィクスチャ + コーパス
    での検証必須**）。Raw 全廃はその前提条件。server 側は `normalize_script_with_oxc` が既に esrap なので、
    Step 1（`$$C$$` hex コメント密輸 → esrap comment hooks `print_with_hooks` へ）で server のテキスト後処理を消す。
- **2026-06-19 PR #1097（Step 2a: derived script-path 3 パスを AST 化、全てバイト一致・コーパス 120 据え置き）**:
  derived バインディングの script 経路テキスト処理を **元の妥当な script 上の単一 AST パス** に統合。
  旧テキスト走査は全て post-wrap の **不正 JS**（`count()++` / `count() = x`：call は代入先になれず再パース不能）を
  走査していた＝§4 の問題そのもの。各旧走査は `wrap_derived_reads_in_script` の **バイトスキャナ fallback 経路でのみ** 生存。
  1. **update 式** `count++`→`$.update_derived(count)`、`--count`→`$.update_derived_pre(count, -1)`
     を `derived_reads_ast::visit_update_expression`（`UpdateExpression{argument: AssignmentTargetIdentifier}`）。
  2. **assignment** `count = x`→`count(x)`、複合/論理 `count += 1`→`count(count() + 1)` を
     `derived_reads_ast::visit_assignment_expression`。LHS を skip_spans でバイパス→`op=` gap を `(` か
     `(name<read> <binop> ` に置換→RHS 末尾に `)` 追加、という **非重複編集** で RHS の read-wrap と
     入れ子 `a = b = 1` を1パスで両立（stable right-to-left splice）。
  3. **$.derived thunk 畳み込み** `$.derived(() => name())`→`$.derived(name)` を新モジュール `unthunk_derived_ast`
     （post-wrap 妥当 JS なので普通に再パース）。
  検証: コーパス 120 据え置き（NEW 0）、`derived_reads_ast` 26/26・`unthunk_derived_ast` 5/5、clippy/fmt clean、CI green。
  **次（task #3 継続）**: 残る script 経路バイトスキャナを順に AST 化。候補（孤立・妥当 JS 優先）:
  `remove_rune_statement`（$effect/$inspect 除去・コメント密輸と絡む＝やや難）、`transform_class_fields_server`、
  store-sub `transform_store_*`。**地雷回避**: template 経路（`wrap_derived_reads_for_template` 84箇所＝§4）、
  `$state.snapshot`（§5）、`each_array` 連番（§5）は単独で触らない。
  大物 = `js_ast` の `Raw(` ~185箇所→oxc AST + esrap（Step 1+3）、blocker 解析（Step 4）、fallback 削除（Step 5）。
  **重要**: 各 `*_ast.rs` パスは「AST 駆動のテキスト編集（splice）」であり最終形ではない。ゴール（テキスト処理ゼロ）には
  Step 1+3 で出力 IR 自体を AST 化し、Step 5 で fallback バイトスキャナを全削除する必要がある。

### 再開手順
```bash
cd /Users/baseballyama/git/rsvelte-ssr-esrap
git fetch origin && git checkout feat/phase3-ast-refactor && git rebase origin/main   # 必要なら
```

---

## 0b. 現在の状態（2026-06-20: big-bang リライト方針へ転換）

**ユーザー指示の更新（重要）:** 「一時的な大規模リグレッション/大量のコンパイルエラーは許容。既存のテキストベース処理は
即座に全削除し、"あるべき理想の AST ベース処理"（upstream visitor 構造の写経 + oxc AST 構築 + esrap 印字）に置換せよ。
まずコンパイルを通し、その後コーパスで1個ずつ正す。既存テストは移植困難なら破棄可。可能な限り並列（エージェント10〜20）。」
→ 漸進的 flag-gate 戦略から **big-bang リライト** に転換。

- **新ワークツリー**: `/Users/baseballyama/git/rsvelte-ast-full`、**ブランチ `feat/phase3-ast-full`**（main `a93f50c0` から作成）。
  以後の作業はここ。`rsvelte-ssr-esrap`/`feat/phase3-ast-refactor` は旧・漸進戦略のもので、本方針では使わない。
- **環境セットアップ済み**: pnpm install / svelte submodule + deps / `node scripts/fixtures/generate-fixtures.mjs` 完了。
  コーパスの重いサブモジュール（svelte.dev/bits-ui 等）は未取得（コーパス検証する段階で `§1` の手順を実行すること）。
- **シードの目標 seam（不変）**: `transform_component(analysis:&ComponentAnalysis, ast:&Root, source:&str, options:&CompileOptions)
  -> TransformResult` と `transform_module(...)`（`3_transform/mod.rs`）。client は `transform_client`、server は `transform_server`。

### ✅ 着地（PR 未・ローカルコミット `6dc5819a`、build/test green）
- **基盤①: `b.*` ビルダー層** `crates/rsvelte_core/src/compiler/phases/3_transform/builders.rs`（`phase3_transform::builders`）。
  upstream `utils/builders.js` の Rust ポート。`B<'a>`（`AstBuilder<'a>` の Copy ラッパ）。`id/member/member_id/call/call_opt/
  new/literal群/operator群/array/object(+init/get/set/spread)/arrow/thunk(0引数 unthunk 畳み込み)/function_declaration/
  const|let|var/制御フロー文/template/program`。**全構築パターンは `js_ast/to_oxc.rs`（variant-complete・oxc 0.136）から逐語移植**
  ＝esrap でバイト一致が保証される。**検証**: `cargo test -p rsvelte_core --lib phase3_transform::builders::tests` 7/7 green
  （各テストが `B` で式/文を組んで `rsvelte_esrap::print` し出力文字列を assert）。

### ★ 完成した地形マップ（8 エージェント調査・本リライトの設計入力）★
- **upstream の移植先**:
  - server `3-transform/server/`: entry `transform-server.js`(430行・`server_component`/`server_module`) + visitors 38ファイル
    (~3.6k行)。global_visitors(script: VariableDeclaration/CallExpression/AssignmentExpression/Identifier/UpdateExpression/
    LabeledStatement/Program/ClassBody/…) + template_visitors(Fragment/RegularElement/EachBlock/IfBlock/AwaitBlock/Component/
    SvelteElement/…) + shared(element.js 561/component.js 359/utils.js 417=process_children/build_template/PromiseOptimiser)。
  - client `3-transform/client/`: entry `transform-client.js`(709) + visitors ~60ファイル(~7.6k行)。RegularElement 747・
    EachBlock 362・VariableDeclaration 429・shared/component 536・shared/utils 517 が大物。
- **印字ターゲット = `rsvelte_esrap`（完成済み, oxc 0.136）**: `print(&Program, source:&str)->String` /
  `print_with(.., &PrintOptions)` / `print_with_hooks(.., &CommentHooks)`（`get_leading`/`get_trailing` で synthetic comment 注入）。
  Program 構築は `AstBuilder::new(&Allocator)` → `b.*` 経由。`source:&str` はコメント補間に使う（構築 AST なら `""` で可）。
- **rsvelte 側の入力（移植元データ）**:
  - **script は oxc ではなく rsvelte 独自 `JsNode`**（`ast/typed_expr.rs`, 60+ variant）が `Root.arena: ParseArena` に格納。
    `Root.instance`/`module: Option<Box<Script>>`、`Script.content: Expression`（`Expression::Typed(TypedExpr{node:JsNode})`
    か `Value(serde_json)` か `Lazy{start,end,ts}`）。**現 Phase-3 はこの AST を使わず source テキストを再パースしている**。
    → **基盤②が必要: `JsNode -> oxc Expression/Statement` 変換器**（`js_ast/to_oxc.rs` の JsExpr->oxc と同型・逐語パターン流用）。
    あるいは既存 `client/visitors/expression_converter.rs`(JsNode->JsExpr) + `to_oxc`(JsExpr->oxc) の2段を server でも再利用。
  - **template は `TemplateNode` enum**(~28 variant, `ast/template.rs`)。`Fragment.nodes: Vec<TemplateNode>`。
    埋め込み式は `Expression`(=JsNode)。属性/ディレクティブは `Attribute` enum（Bind/On/Class/Style/Transition/Animate/Use/Let/Spread/Attach）。
  - **Phase-2 `ComponentAnalysis`**(`2_analyze/types.rs:1671`): `root: ScopeRoot`(`bindings:Vec<Binding>` flat + `all_scopes`),
    `Binding.kind: BindingKind`(State/RawState/Derived/Prop/BindableProp/RestProp/StoreSub/LegacyReactive/EachItem/Snippet…),
    `root.get_binding(name, scope_idx)`. `reactive_statements`, `exports:Vec<Export{name,alias}>`, flags
    (`uses_props/uses_rest_props/uses_slots/needs_props/needs_context/uses_component_bindings/props_id/custom_element/
    inject_styles/css.hash`). **gap: `css.ast` は未保持**（必要なら別途）。`instance_body.hoisted` は JSON(現状未活用)。
  - **既存 client framework は table-driven ではなく手書き再帰下降**: `ComponentContext::visit_node`(types.rs:85) の巨大 match +
    `ComponentClientTransformState`(init/update/template/hoisted/consts/let_directives バッファ + memoizer + transform map)。
    visitor は戻り値ではなくバッファに `JsStatement`/`JsExpr` を push。→ **server リライトも同型の手書き再帰下降にし、
    出力を `b.*`(oxc) にする**のが最善（zimmerframe 汎用 walker を新規構築する必要はない、というのが調査の結論）。

### ★★ 決定的アーキ知見（2026-06-20, 基盤②着地で判明）★★
**rsvelte の parse-phase `JsNode` 表現は LOSSY**＝完全な AST ではない。`1_parse/read/expression.rs` の `_for_program`
lowering が以下を **opaque `JsNode::Raw`(serde_json) に退化**させて格納する: **ブロック本体アロー** `() => { … }`
(8159)、**関数式** `function(){}`(8179)、**分割代入ターゲット** `[a]=x`/`{a}=x`(9309)、**`export` 宣言**(6580)、
**bigint** は variant 無しで `identifier("unknown")` に退化(8828)。
→ **含意（重要）**: スクリプト/テンプレ式の変換に parse-phase `JsNode` を使うと、これらの一般形（特にイベントハンドラの
ブロックアロー `onclick={() => {…}}`）で **fidelity を失う**。したがって本リライトの **第一級の JS 取得戦略は
「ソーススパンを oxc Parser で再パースして faithful な oxc AST を得る」**こと（＝現 Phase-3 が script で既にやっていること、
`server/build.rs:62` の `Parser::new(&alloc, &stripped, mjs).parse()`）。**これは「テキスト処理」ではない**＝入力をパースして
AST 化するのは正当（ゴールが禁じるのは OUTPUT JS を文字列操作すること: byte-scanner / 文字列連結 / Raw 密輸）。
`jsnode_to_oxc`（基盤②, 18/18 green）は **lossy でないケース専用の補助**として残す（テンプレ単純式の高速路 / 参照実装）。
**変換の本体は oxc AST 上で行う**（upstream が ESTree を直接 transform するのと同型）。oxc AST の変換機構は
`oxc_ast_visit`(Visit/VisitMut) または手書き再構築（`b.*`）。`derived_reads_ast.rs` の既存 AST 編集パスも参照。

### ★★★ 核心メカニズム確定（2026-06-20, spike で実証）★★★
**禁止: span-driven string splice。** コードベース既存の 38 個の `*_ast.rs`（`shared/ast_rewrite.rs` の `with_program`+`splice`、
immutable `Visit` で `(start,end,replacement)` を集めソーステキストを `replace_range`）は **AST 駆動だが OUTPUT は文字列編集**＝
**ゴールが禁じる「テキスト処理」そのもの**（handoff が「最終形ではない」と明記）。**サブエージェントが「これを使え」と推奨してきても却下せよ。**
**oxc 0.136 に `VisitMut`/`oxc_traverse` は無い**（`oxc_ast_visit` は immutable `Visit` のみ）。
**確定アプローチ（spike `builders.rs::spike_inplace_oxc_mutation` で実証・green）**:
1. **入力**: スクリプト/テンプレ式の**ソースを oxc Parser で faithful にパース**（`Parser::new(&alloc, src, mjs).parse()` → `ret.program`、
   エラーは `ret.diagnostics`）。lossy な parse-phase JsNode は使わない。
2. **変換**: **oxc AST を `&mut` 手書き再帰下降で in-place mutate**（`program.body.iter_mut()`, `&mut Expression`,
   `call.callee = b.id("$.state")` 等の代入で置換）。`oxc_allocator::Box`/`Vec` は `&mut` 経由で書き換え可能と実証済み。
   ノード新規構築は `b.*`(builders.rs)。`std::mem::replace` で式まるごと差し替えも可。
3. **出力**: `rsvelte_esrap::print(&program, src)` で一度だけ印字。
→ これで「テキスト処理ゼロ」を満たす。upstream の zimmerframe walk+return-replacement と同型（in-place mutate 版）。

### 進捗（2026-06-20, feat/phase3-ast-full・全 green・oracle 検証済み）
`transform_server`（既存テキスト版＝SSR フィクスチャ全通過＝**正しい**）を **oracle** として、新 `server/ast/` の出力を
正規化比較する gate を確立。これで visitor port が安全＆並列化可能に。**コミット列**: builders → jsnode_to_oxc → doc →
mutation-spike → server-skeleton → template-framework → block-visitors。
- ✅ **server skeleton** `server/ast/mod.rs`: `ServerTransformState<'a>{b,analysis,options,hoisted,body,template,each_index,…}`
  + `server_component_ast(...)`（hoisted import + `export default function Name($$renderer,$$props){props prologue + template}`）。
  実 parse+analyze ハーネスでテスト。**`transform_server` は未接続**（並行・無変更）。
- ✅ **template framework** `server/ast/visitors/shared.rs`: `process_children`/`build_template`/`build_fragment_body`/
  `build_fragment_block`（upstream 写経）。`TemplateEntry=Literal|Template|Stmt`、隣接静的を 1 つの ``$$renderer.push(`…`)`` に
  coalesce、`{expr}`→`${$.escape(expr)}`。`visit_expr`=jsnode_to_oxc + span 再パース fallback。
- ✅ **visitors（oracle byte 一致）**: RegularElement(静的/boolean 属性)・Text/Comment/ExpressionTag・HtmlTag・
  IfBlock(`<!--[n-->` マーカー, else-if chain)・EachBlock(`$.ensure_array_like`+for, sync/unkeyed)・KeyBlock・SnippetBlock(hoist)・
  AwaitBlock(sync)。**注**: テキスト oracle は block 本体を 1 タブ浅く出力するが esrap は正しくインデント→corpus の oxfmt が吸収
  （AST 版が正しい）。block テストは indent 非依存比較。
- **KNOWN GAP（未 port）**: 全 async path(`create_child_block`/PromiseOptimiser/blockers)・keyed/animated each・each `{:else}`・
  Component・SvelteElement/Head/Fragment/Boundary・SlotElement・RenderTag・SpreadAttribute・動的/directive 属性・
  `<select>/<option>/<textarea>` 特殊・dev マーカー。**そして最大の本丸＝instance/module script の rune lowering(下記)**。

### 進捗追補（2026-06-20 後半）: script 宣言変換 着地
✅ `server/ast/script.rs`（非delicate slice）: instance/module `<script>` を oxc 再パース→ in-place で宣言 reshape
（`$state`→bare値, `$derived(e)`→`$.derived(()=>e)`, `$derived.by(f)`→`$.derived(f)`, `$props()`→`<pat>=$$props`,
`$props.id` drop, top-level `$effect`/`$inspect` 除去, import hoist, それ以外は span 再パースで verbatim 保持）→
`server_component_ast` の body/module に emit。**各 instance 行が oracle 一致**。値式は `visit_expr` 素通し（read 変換は未）。
server suite 132/132・ast 11・builders 13 green。新 builder `var_decl_from_pairs`。**KNOWN GAP**: read-wrapping/store-get/
snapshot/`$$sanitized_props`（delicate・下記）, TS script, async-derived, 複雑 pattern(extract_paths), `props_id` 再 emit,
`needs_context` の `$$renderer.component` wrapper, legacy(非runes) 分岐。

### ★ 次の crux: read-wrapping 単一パス（derived/store/snapshot/sanitized_props）★
**重要な再認識**: 新 oxc-in-place アーキでは **single-pass by construction** ＝ 1 回の構造 walk で各 Identifier read を
binding-kind に応じて**ちょうど一度だけ** wrap する。旧テキスト多段 wrap の二重化地雷（§4「reverted twice / 498-failure」）は
**構造的に発生しない**（同じ式 AST を 2 度 wrap するコードを書かない限り）。よって delicate だが旧アプローチより安全。
**必要なもの**: (1) walk を通した **scope index のスレッディング**（`analysis.root.get_binding(name, scope_idx)` で binding 解決）、
(2) upstream `server/visitors/Identifier.js` + `shared/utils.js::build_getter` の写経（server の read 規則:
derived → `$.get(name)`? 要確認、store_sub `$x` → `$.store_get($x, "$name", $$stores)`, props → `$$sanitized_props` 経由 等）、
(3) binding-kind → wrapper のマップ。**`visit_expr` と script の値式変換を、この単一 read-pass に通す**。
§5 地雷（snapshot 意味論・each_array 連番・should_proxy）は単独で触らない。検証は oracle（{count} 等の定数畳み込み含む全体一致）。
**これが通れば** `transform_server` を新 pipeline に接続 → 旧テキスト全削除。

### ★★★ マイルストーン（2026-06-20, サーバーSSR実質完成）★★★
`feat/phase3-ast-full`（~49コミット）。サーバーSSRをゼロから純AST(oxc+esrap)で再構築（`server/ast/`、旧版と別に追加）。
全テンプレ/ブロック visitor + script変換(runes/legacy/destructure/reactive/class-field/$props/$bindable) + read-wrapping
+ 空白(clean_nodes) + CSS + 動的属性/bind/spread/class:/style: + entry-assembly + svelte:head/element/window/body/
boundary/slot + const/debug-tag + select/option + content-bind + dynamic-component + is_standalone + TS + 定数畳み込み。
**ワークフロー**: 並列隔離worktreeバッチ(専用 target-dir, disjoint files, 自己検証+commit → main が cherry-pick統合+
結合ビルド1回) + オラクルharness(`corpus_new_vs_oracle`) + 診断read-onlyエージェント。
**真のゲート(env `RSVELTE_SERVER_AST=1`)**: `--test ssr`(ランタイム実行) **96/97**(残1=attr定数畳み込み); `--test
compiler_fixtures`(byte-exact vs公式) **19/29**(失敗10=**async 7**+nullish+class-field-ctor); oracle harness compared比84.9%。
**→ サーバー最後の大物=async**。**調査結論（重要）: blocker解析は既ポート・再利用可**。`shared/async_body.rs::
compute_blocker_map(raw_script)→FxHashMap<name,idx>` / `compute_blocker_primary_names` / `helpers::
find_expression_blockers(expr_text,map)→Vec<idx>` / `transform_async_body(script,"$$renderer.run")→{output,map}`
は全て文字列ベースで as-is 再利用可。新pipelineは `state.eval_inputs.top_level_blocker_map` に既に保持。
**残るは AST ラッピングのシェルのみ**。**段階計画**: Stage0(逐次土台)=`shared.rs::create_child_block(stmts,
blocker_idxs,has_await)`(空→そのまま/blocker→`$$renderer.async_block([$$promises[i]…],arrow)`/else→`child_block`)
+ `$.save`/await包みヘルパー(`(await $.save(x))()` / `async()=>$.escape(await …)`、現状ゼロ、`in_block_body` 親walk述語の
AST化要) + const blocker map を state に。Stage1(逐次)=`script.rs` top-level-await分割(`transform_async_body` の文字列
output を reparse) + async-`$derived`(`$derived(await…)`→`await $.async_derived(()=>…)`、現 script.rs は plain $.derived=GAP)。
Stage2(**並列可**)=if_block/each_block/await_block/expression_tag の async分岐(disjoint visitor, Stage0 を read-only 共有)。
Stage3=const_tag run() + render/component/slot/key PromiseOptimiser。**gotcha**: AST `is_async()` は has_await のみ(blocker
未反映, template.rs:1326 TODO)→blocker検出は文字列 `find_expression_blockers(expr_text)` 経由で(旧pipeline同様)。
async+残2(nullish/class-field-ctor)+97番目(attr定数畳み込み) → byte-exactゲート緑 → フラグdefault化/除去 → 旧6モジュール
削除 → クライアント側(js_ast Raw全廃→to_oxc→codegen.rs削除)。**注**: release fixtureは専用 target-dir(debug/release混在は
E0308 stale-artifact誤検知)。

### ★ （旧）本丸: instance/module script transform（最delicate・最大のテキスト削除＝transform_script.rs 8.4k 行）★
現状 `server_component_ast` は **instance body 空**＝`<script>` ロジックを持つコンポーネントは oracle 不一致。これを埋めるのが
最大の勝ち。**やり方（§核心メカニズム + §4 厳守）**: スクリプトを oxc 再パース → **in-place `&mut` mutate** で rune lowering
（`$state(x)`→`$.state(x)`, `$derived(e)`→`$.derived(()=>e)`, `$props()` 分割, store `$x`→`$.store_get`, `$effect`/`$inspect` 除去,
legacy `$:`）。**§4 の決定的知見厳守**: derived/store/special-var は **生の式 AST に一度だけ**適用する単一パス（多段 wrap は
二重化回帰）。**§5 地雷**（snapshot 意味論・each_array 連番・should_proxy）は単独で触らない。**delicate ＝ サブエージェント
丸投げ禁止、メインが直接 + oracle 全 SSR フィクスチャ検証**。これが通れば `transform_server` を新 pipeline に接続 →
`transform_script.rs`/`build.rs`/`helpers.rs`/`transform_store.rs`/`bridge.rs`/`esrap_layout.rs` を削除。

### 次の作業順（big-bang・常時コンパイル可能を維持しつつ）
1. ✅ **基盤②: `JsNode -> oxc` 変換器** `3_transform/jsnode_to_oxc.rs`（`jsnode_to_oxc_expr`/`_program`/`jsnode_stmts_to_oxc_program`、
   `Cx{ab,arena}`、`Option` 返し）。`to_oxc.rs` 逐語移植。**18/18 esrap round-trip green**（rsvelte 自身の `parse_program_with_error`
   でパース→変換→`rsvelte_esrap::print`→byte 比較）。bail: Raw/Class*/StaticBlock/Decorator/TS-only/bodyless-fn/re-export。
   ※テストは `with_serialize_arena(&arena, …)` 内で実行要（さもないと arena が空に見える, `1_parse/mod.rs:194` 参照）。
2. **server スケルトン**: `ServerTransformState`(oxc allocator/B + hoisted/init/template バッファ) + `server_component`/`server_module`
   を upstream `transform-server.js` 写経で構築。visitor は最初 stub（`b.empty()` 等）でコンパイルを通す。`transform_server` を接続。
3. **旧 server テキストモジュール削除**: transform_script.rs(8.4k)/build.rs テキストパス/helpers.rs バイトスキャナ/transform_store.rs/
   bridge.rs/esrap_layout.rs。削除でコンパイルエラー大量 → スケルトン + stub で通す。
4. **server visitor 並列ポート**: upstream 38ファイルを `b.*` で1つずつ写経（10〜20 並列、メインが diff レビュー + コーパス検証）。
5. **client**: js_ast `Raw` 全廃 → `to_oxc` 経由に一本化 → `codegen.rs`(3.3k) 削除。
6. **shared**: `async_body.rs::compute_blocker_map(raw_script)` を AST 化。
7. **仕上げ**: `grep` で Raw/バイトスキャナ 0 を CI ガード化。コーパス green。`pnpm run test-and-update`。

**検証ゲート**: byte-exact は `cargo test --release --test runtime --test compiler_fixtures`（`ssr`/`snapshot` 単一ターゲットは無い、
`ssr_*` 個別）。コーパスは `§2` 手順（重いサブモジュール取得後）。**ビルドは必ず1本ずつ**（`§2 教訓1`）。

---

## 1. 環境セットアップ（ワークツリーは未セットアップなことがある）

一度きりの重いセットアップ。`RAYON_NUM_THREADS=2` + `nice` でローカル負荷を抑える。
```bash
cd /Users/baseballyama/git/rsvelte-ssr-esrap
pnpm install
git submodule update --init --depth 1 submodules/svelte           # 公式コンパイラ(オラクル)
(cd submodules/svelte && pnpm install --frozen-lockfile)           # esrap 等が必要
git submodule update --init --depth 1 submodules/svelte.dev submodules/bits-ui \
    submodules/flowbite-svelte submodules/melt-ui submodules/shadcn-svelte
node scripts/fixtures/generate-fixtures.mjs                        # フィクスチャ生成
node scripts/compat-corpus/collect.mjs                             # コーパス収集(~10,160 entries)
```

---

## 2. ビルド/検証ループ（★最重要の教訓あり★）

ユーザー指示: **lint/test は CI で**、ローカルは「制約付きビルド」のみ（マシンが重いため）。
ただし NAPI バイナリのビルドはコーパス検証に必須。

### ★教訓1: ビルドは必ず「1本ずつ」★
複数の `cargo build` を並行させると競合してマシンが thrash し、1ビルドが **20分超** に膨れる
（本セッションの遅延の主因はこれだった）。**新しいビルドを始める前に必ず既存ビルドの完了を待つ**か、
`pkill -9 -f "cargo build --release --features napi"; pkill -9 rustc` で殺してから1本だけ走らせる。
1本なら(ロード次第で)概ね数分〜10分弱で完了する。

### NAPI ビルド + ステージ
```bash
cargo build --release -p rsvelte_napi --lib
mkdir -p .corpus-cache && cp target/release/librsvelte_napi.{dylib,so} .corpus-cache/rsvelte.node.staging && mv .corpus-cache/rsvelte.node.staging .corpus-cache/rsvelte.node
```
- 旧記述（`--features napi` + `librsvelte_core.dylib` を自前で `cp`）は、cdylib が
  `rsvelte_napi` に分離される前のもの。`rsvelte_core` は現在 rlib のみで dylib を出さず、
  `napi` feature も存在しないため、当時の手順はいずれの行も再現しない。
- ★教訓3: ポーリング（`grep Finished` 等）を毎ターン叩くと nice されたビルドの CPU を奪い遅くなる。
  バックグラウンドビルドの**完了通知を待つ**のが速い。

### コーパス検証
```bash
node scripts/compat-corpus/compile.mjs                            # 両コンパイラ×両ターゲット (~13s)
node scripts/compat-corpus/verify.mjs --max-print 0               # 回帰チェック。"NEW failures" が出たら即 revert 判断
node scripts/compat-corpus/cluster.mjs                            # 失敗を差分シグネチャでグルーピング
node scripts/compat-corpus/one.mjs '<id>' --target server         # 1件の差分(正規化後)
node scripts/compat-corpus/one.mjs '<id>' --target server --raw   # 生差分
node scripts/compat-corpus/verify.mjs --no-fmt --update-baseline  # 修正がクリアしたらベースライン縮小
```

### ★教訓4: 比較は formatting を吸収する → byte-exact 回帰はコーパスで見えない★
`verify.mjs` は oxfmt + acorn AST-structural 比較で、**空行・コメント・引用符・インデントを正規化吸収**する。
よって「空行/コメント位置」の回帰はコーパスでは無罪放免だが、**byte-exact なフィクスチャ suite（runtime/ssr/snapshot）では落ちる**。
→ byte-exact suite は CI 任せ。コーパス無回帰でも CI で runtime 等が落ちることがある（毎 push で CI 確認）。
また「コーパスで X件 NEW failure」のとき、差分は **whitespace-insensitive** で取ると構造的差分が見える
（`s.split('\n').map(l=>l.replace(/\/\/.*$/,'').trim()).filter(Boolean)` で比較）。

### ★教訓5: push ごとに CI を**全ゲート**確認★（corpus だけ見ない）
本セッションで Clippy が数 push 失敗し続けたのを見落とした。`gh pr checks <PR>` で
Clippy / Documentation / Test runtime / Compatibility Report / Corpus / fmt を毎回確認。
よく踏むCIエラー: `clippy::collapsible_if`（let-chain 化）、`clippy::manual_strip`（`strip_prefix` 使用）、
rustdoc broken-intra-doc-links（`[`fn`]` リンクは別モジュールだと壊れる→ただの code 表記に）。
`cargo fmt -p rsvelte_core` を commit 前に必ず実行。pre-commit hook はこのワークツリーでは無効。

---

## 3. アーキテクチャ（現状 → 目標）

### 現状（テキスト処理が残っている箇所＝駆逐対象）
- `server/transform_script.rs`（~7.7k行）: `wrap_derived_reads*`, `remove_rune_statement`,
  `compute_shadow_ranges`, `mask/unmask_nested_reactive_labels`, `rewrite_derived_update_expressions`,
  `transform_class_fields_server`, `transform_store_*` など**バイトスキャナ群**。
- `server/helpers.rs`: `skip_string_literal`, `skip_braces`, `extract_imports*`, await バイトスキャン等。
- `shared/async_body.rs`: `compute_blocker_map(raw_script)` の生スクリプト走査。
- `server/transform_legacy.rs`: `mask_nested_reactive_labels` 等。
- `server/build.rs`: `normalize_script_with_oxc`（oxc parse→esrap print の**サブブロック専用**）、
  コメント hex 密輸（`$$C$$`）、`strip_empty_statements`、再インデントループ等の**文字列ポストパス**。
- `server/esrap_layout.rs`: `${...}` の改行有無を esrap に合わせる**文字列 reflow**（AST化すれば不要）。
- 出力 IR: `3_transform/js_ast/`（`nodes.rs`/`builders.rs`/`codegen.rs` 125KB）= **独自 IR + 独自 codegen**。
  `Raw(String)` 抜け穴が **client+server 合わせて ~185箇所**。最終印字は `js_ast::codegen::generate`（esrap ではない）。
- `transform_server_module`（mod.rs:130〜, `.svelte.(js|ts)`）は**完全に文字列ベース**（`parts: Vec<String>` を join）。

### 目標
template AST + 解析 →（visitor で oxc AST を AstBuilder 構築）→ `rsvelte_esrap::print` で一度だけ印字。
`rsvelte_esrap` は完成済み（`crates/rsvelte_esrap/`、oxc 0.136、コメントストリーム・raw 保持・sourcemap 対応、
golden + esrap サンプル green）。upstream の `submodules/svelte/.../3-transform/server/` が**仕様**（`b.*` builder）。

---

## 4. ★決定的知見（必読）: derived-read 等は「単一 AST パス or 全滅」★

`docs/phase3-ast-refactor-plan.md` 末尾「Findings (2026-06-19)」に詳述。要点:

- **インスタンス/モジュール script の `wrap_derived_reads` は既に AST**（`server/derived_reads_ast.rs`）で、
  「derived を 0引数 callee として呼ぶ」ケースを一律 wrap するよう拡張済み（`inactive()` → `inactive()()`）。
  これで **`$derived` currying をインスタンス側で回帰ゼロ修正**できた＝**AST 方式が正解の証拠**。
- **テンプレート式の derived wrap は1パスずつ AST 化できない。** `wrap_derived_reads_for_template` は
  store 変換後・**一部が既に `name()` に wrap 済み**のテキストに対して、しかも**84箇所**から多段で呼ばれる。
  バイトスキャナの「call位置スキップ」は currying 対策ではなく**冪等性（二重wrap防止）のために load-bearing**。
  → テンプレート経路を AST パスに通すと既wrap `code()` が `code()()` に**二重化し ~220件回帰**（2回実証）。
- **核心:** ソースの `derived()`（currying＝`derived()()` にすべき）と既wrapの `derived()`（そのまま）は、
  部分変換後では**テキストでも AST でも区別不能**。→ **derived/store/special-var 変換は「生の式 AST に一度だけ」**
  適用する単一パスに統合する以外に道はない。Step 2/3 は多段テキスト wrap を**一括で単一 AST パイプラインに置換**する。

---

## 5. ★地雷（やってはいけない / 回帰多発として実証済み）★

本セッションで試みて爆発・revert したもの（中央検証で着地前に阻止した）。ドキュメント `corpus-remaining-work.md`
の「reverted twice / 498-failure」警告と一致。**AST 単一パス化以外の方法で触らないこと。**

| 領域 | 何が起きたか |
|---|---|
| テンプレート経路を AST パスに routing | ~220件回帰（二重wrap）。§4 参照。単一パス再構成が前提。 |
| `each_array` のカウンタ共有/順序変更 | **529件回帰**（コンポーネント全体で each_array 番号が再採番）。 |
| `should_proxy`（props を default 型で non-proxy 分類） | runtime フィクスチャ含む回帰。`client/mod.rs` の `non_proxy_vars` に文書化済みガードがあり、反転禁止。 |
| `$.snapshot` 意味論 | 2方向（追加すべき/削除すべき）が混在、相互依存で回帰しやすい。 |
| サブエージェントへの繊細なバイト一致変換の丸投げ | タイムアウト/誤診断/文書化済み決定の反転を**複数回**起こした。**必ずメインが diff レビュー + 中央検証**。 |

---

## 6. 検証ゲート（各 PR で）

```bash
# byte-exact フィクスチャ（CI でも走るが、リスキーな変更はローカルでも。1本ずつビルド後）
CARGO_TARGET_DIR=/tmp/mywork RUST_TEST_THREADS=2 RAYON_NUM_THREADS=2 RUST_MIN_STACK=33554432 \
  cargo test --release --test runtime --test ssr --test compiler_fixtures --test snapshot
# esrap クレート（printer 変更時）
cargo test -p rsvelte_esrap --release        # golden_roundtrip_ratchet + samples
# lint/fmt
cargo fmt && cargo clippy --all-targets --all-features -- -D warnings
# コーパス（§2）→ ベースラインは縮小のみ。NEW failure が1件でも出たら原因特定 or revert。
```
- 変更系統が `fix`/`feat` の PR は **changeset 必須**（`.changeset/*.md`、`"@rsvelte/compiler": patch`）。
- マージは squash（`gh pr merge <PR> --squash`、draft なら先に `gh pr ready`）。

---

## 7. 推奨ステップ順（常時グリーン・1 PR ずつ）

`docs/phase3-ast-refactor-plan.md` の Step 1〜5 に従う。具体化:

1. **Step 2a: サーバ script 変換の単一 AST パス化**（最大の勝ち）。
   `transform_script.rs` の **インスタンス/モジュール script** 系パス（`remove_rune_statement`,
   `rewrite_derived_update_expressions`, `transform_class_fields_server`, store サブ解決, assignment lowering）を
   `oxc_ast_visit` ベースの**単一 pipeline** に置換。`derived_reads_ast.rs` の既存パターンを踏襲。
   upstream `server/visitors/*.js` をファイル単位で写経（多くは <50行）。shadowing は Phase-2 scope tree で解決。
2. **Step 2b: テンプレート式変換の単一 AST パス化**（§4 の本丸）。
   84箇所の `wrap_derived_reads`/`transform_store_refs` 呼び出しを**1つの AST 変換に統合**し、
   生の式 AST に対して derived-wrap + store-get + special-var を**一度だけ**適用。これで template currying と
   `$.stringify`/snapshot 系の多くが落ちる（はず）。**段階的 swap は不可** — まとめて置換。
3. **Step 1+3: 出力を oxc AST + esrap 一括印字へ**。`js_ast` IR を `oxc_ast::Program`（AstBuilder）構築に置換し、
   `rsvelte_esrap::print` で印字。`build.rs` の `normalize_script_with_oxc`/コメント hex 密輸/`esrap_layout.rs`/
   再インデントを削除。コメントは Phase-1 から position-sorted `Vec<Comment>` で printer に渡す（printer は対応済み）。
4. **Step 4: `async_body.rs::compute_blocker_map(raw_script)` を AST 解析へ**（Phase-2 メタデータと統一）。
   注意: メモ `feedback_has_call_semantics` — Phase-3 は「任意 CallExpression」、Phase-2 は「非 pure callee」で
   意味が異なる。混同すると runtime 回帰。
5. **Step 5: 仕上げ**。`grep -rn "JsStatement::Raw\|JsNode::Raw"` が printer の raw 対応以外で 0 になること。
   バイトスキャナ（`skip_string_literal` 等）の死蹟削除。新規 `Raw(`/バイトスキャン導入を弾く CI grep ガード追加。
   最終: コーパス 0件 + 全フィクスチャ + フルレビュー(major 0) + 全CIグリーン。

各ステップ後 `pnpm run test-and-update` で README/ダッシュボード更新。

---

## 8. 既にコーパスで残っている主なクラスタ（120件、参考）

- `$derived` currying のテンプレート側（TabItem/CloseButton/SectionHeader 等、~14件）→ Step 2b で解消見込み。
- `should_proxy`/`$.snapshot`/signal-bind getter-setter → Step 2 の単一パス化で正しく扱える見込み（地雷なので単独修正禁止）。
- クライアントのコメントストリーム（removed 文のコメントが次ノードへ再付着）→ Step 1+3（printer のコメント機構）で解消。
- ロングテールの個別差分。

`node scripts/compat-corpus/cluster.mjs` で最新の内訳を取得すること。

---

## 9. プロセス規律（ユーザー指示）

- メインは Opus、個別調査/修正は **Sonnet サブエージェントに明確な指示**で委譲してコスト最適化。
  ただし **成果物は必ずメインが diff レビュー + 中央でコーパス/ビルド検証**（サブエージェントは繊細な変換で
  誤診断・文書化済み決定の反転を複数回やらかした実績あり。§5）。
- リスキー領域（§5）はメインが直接、full fixture/CI 検証付きで。
- 「完璧な品質」優先 — グリーンな main を壊す変更は入れない。各ステップ常時グリーン。
- コミットは atomic、conventional commit、末尾に
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。push は CI 確認とセットで。

---

## 10. `process_accumulated` の段別内訳

> ### ★★★ この節の最重要事項: 推定量を変えたら 3 コーパスの描像が一致した ★★★
>
> 単発 run のシェアでは「アプリ 2 本で 1 位の行が排他」という描像が出ていた。
> **n≥6 の min に変えたら、`reactive_stmt` が smelte・carbon で 1 位、
> open-webui でも 2 位（首位と 0.2 点差）** ＝ **全コーパスで首位級**という
> 一致した描像になった。
>
> **合わせに行っていない不一致が減ったことが、この推定量の唯一の妥当性根拠である。**
> 「話が綺麗になった」だけなら何の証拠にもならないが、
> **調整していない次元で不一致が減るのは、推定量が実際に汚染を除いている証拠**。
> 機序が目に見える形で出たのが `member_mutations`:
> **min 12.108ms / max 100.579ms（8.31 倍）** で、単発では open-webui の 1 位に
> 見えていたものが min では **7 位（0.73%）** に落ちる。
>
> ★ 「1 位が排他」という主張は本日 3 つの形（10〜11 倍の排他 →
> 2.0 倍への縮小 → 順位そのもの）で全て汚染の読み取りだった。
> **ノイズが実証済みのマシンで、単発 run から順位を作らないこと。**

`compile_profile` の `pa_rest`（= `process_accum − runes − reactive_stmt`）は
**未帰属の残差でしかなかった**ので、クロージャ全域（`client/mod.rs` の
`process_accumulated`）を **22 の名前付きステージ**に割り、各ステージに
`Duration` と**決定論的カウンタ**（呼び出し回数と入力バイト数。`join` だけは
行数）を付けた。`other` 行を明示して、シェアを親と突き合わせられるようにしてある。

計測は feature `measure-pa-split`（既定 off）。**ゲートする理由**: この連鎖は
1 文ごとに走るので、22 個の `Instant` ペアは**比較対象である親の内側**に落ちる。
profiler は同一プロセス内で 1 ペアの実費を較正し、`PA-OVERHEAD` 行として出す。

### ★★★ 読み方: 同一 run 内のシェアも負荷に対して不変ではない（撤回）★★★

**この節の以前の版は「同一 run 内のシェアは負荷が相殺されるので使える」と
書いていた。これは誤り。** smelte を 2 回回して安定だったこと（n=2）を
一般化したもので、**大きいコーパスでは成立しない**。

**同一バイナリ・同一コーパスの 6 連続 run**（カウンタは全 run でビット一致:
smelte `statements` 765 / `pairs` 7465、carbon 6101 / 82833、
open-webui 7680 / 110956）で、**親に対するシェアの最大 spread**:

| corpus | files | 親の spread | **シェアの最大 spread** | 該当ステージ |
|---|---|---|---|---|
| smelte | 74 | 1.63x | **1.54x** | `stores` |
| carbon/src | 291 | 2.93x | **17.45x** | `export_let`（3.07% ↔ 53.57%） |
| open-webui | 650 | **1.39x** | **30.00x** | `rest_prop_member_access`（0.52% ↔ 15.73%） |

**★ open-webui の行が決定的 ★**: 親は 1.39 倍しか動いていないのに、
個々のステージのシェアが 30 倍動く。**一様な減速では安定した合計を
再分配できない** ＝ 摂動は**ステージ単位**であり、シェアでは割り切れない。

**機序の仮説（[S]、未測定）**: 摂動は**時間窓**で起き（P/E コア移行・
周波数スケーリング・他プロセスとの競合）、コーパスのファイルは**順に**処理される。
ファイルは不均質なので、ある時間窓に活動しているステージだけが窓のコストを吸う。
run が長いほど窓に当たる確率が上がるので、**smelte（74 files）が安定で
carbon/open-webui が不安定**という観測とも整合する。

**結論: 単発 run のシェアを表に載せてはいけない**（本文で断っても表は測定値に見える）。
代わりに **n≥5 の最小値**を使う（下）。

### ★★★ 推定量: n≥5 の **min**（スケジューラ干渉は加算しかしない）★★★

**干渉はステージの時間を増やすことしかできず、減らすことはできない。**
よって**複数 run の最小値が最も汚染の少ない観測**であり、
かつ**どの run が汚染されたかを同定する必要がない**という性質を持つ。
これは決定的に重要で、**壁時計では汚染 run を同定できない**ため
（別調査: carbon 全体 r2 = total 1024ms / stage 198.8ms に対し
r4 = total 1004ms / stage 30.2ms。**同じ総時間で stage が 6.6 倍違う**）、
「遅い run を捨てる」という直感的な手当ては**汚染された方を残す**。

**★ 有限 n の min は「真値の上界」であって不偏推定量ではない ★**
n が増えると上から収束する。単一ステージの報告としては誠実だが、
**A/B では両アームとも上界**になるので、比較が公平なのは
**両アームが同じ n・同程度の干渉を見たときだけ** ＝
**1 セッション内でアームを交互に回すこと**。

**★★★ min が上界なのは「時間」であって「比」ではない ★★★**
シェアは `stage_min / parent_min` で、**分子も分母も膨らんでいる**ので
バイアスの符号は打ち消し合いで決まる。`P = p + δp`, `S = s + δs` と書くと:

```
実測シェア ≤ 真のシェア  ⟺  δs/s ≤ δp/p
```

符号を決めるのは**絶対量ではなく相対汚染**である。そして
**親は全ステージの汚染を集める**のに対し、1 ステージは自分の分しか吸わない。
したがって**自分が主たる吸収源でないステージでは `δp/p > δs/s` となり、
実測シェアは過小評価**になる。親の暴露窓は定義上 run 全体なので、
run 長が効くという観測がそのまま効く。

**規則: min の下で「シェア」を引用するときは上界という語を外すこと。**
「min over n=6 の推定値。**過小評価の可能性が高い**（分母は分子が吸わない
汚染まで吸うため）」と書く。**時間には上界、比には推定値。**
この種の但し書きは「慎重そうに見える」ので**そのまま転記される** — だから
シェアの表に付けてはいけない。

**不安定性は corpus ではなく run 長に追従する**（別調査）:
carbon の 73 ファイル部分集合（`$:` 密度は全体と同一 0.75/KB、253 KB）は
spread **1.02x** で smelte の 1.01x と同等。全 carbon（1015 KB）は 7.6x。
→ **~250 KB を超えたらチャンク分割して測る**。小さいコーパスへの退避ではない。

**バイナリをまたぐ ON/OFF 比較はさらに悪い**（svelte-ux で
`process_accum` が OFF 41.30ms / ON 21.06ms と符号が反転）。
**カウンタは全条件でビット一致**（ON/OFF、6 連続 run）＝
仕事は動いていない、動いたのは時計だけ。

### `pa_rest` のシェアは `$:` 密度でほぼ決まる（★「69% を棄却」は誤り★）

| corpus | 種別 | files | stmts | `$:`/stmt | `process_accum` | `reactive_stmt` | **`pa_rest`** |
|---|---|---|---|---|---|---|---|
| smelte | lib | 74 | 765 | 12.8% | 26.8% of compile | 55.0% of parent | **44.8%** |
| sveltestrap | lib | 129 | 1177 | 10.7% | 21.6% | 48.7% | **51.1%** |
| svelte-ux | lib | 198 | 1581 | 12.4% | 15.5% | 53.0% | **46.8%** |
| **carbon/src** | **app** | **291** | **6101** | **12.5%** | **36.8%** | **52.5%** | **47.4%** |
| shadcn-svelte | lib(runes) | 1682 | 1951 | 0% | 1.1% | 0.0% | 89.5% |
| **SMUI** | **app(runes)** | **449** | **1617** | **0%** | **2.1%** | **0.0%** | **90.5%** |

定義上 `pa_rest/parent = 1 − reactive_share − runes_share` なので、この列は
**独立した情報を持たない**。**親比で報告するのをやめること。** 仕事を見積もれるのは
絶対値（compile 比）だけである。

**★ 親比で見えた「食い違い」は全て分母の移動だった ★**

| repo | `pa_rest` 元 | **再測** | `reactive_stmt` 元→再測 | `process_accum` 元→再測 |
|---|---|---|---|---|
| SMUI | 1.7% | **1.9%** | 0.00 → 0.00 | 2.0 → 2.1 |
| carbon/src | 16.8% | **17.4%** | 13.4 → 19.3 | 30.3 → 36.8 |
| open-webui | 22.4% | **20.9%** | 3.8 → 1.9 | 26.3 → 22.9 |

**compile 比の `pa_rest` は 3 リポジトリ全てで再現する。** carbon の「55% → 47.4%、
8 ポイントの乖離」は `pa_rest` の乖離ではなく（16.8 → 17.4）、
**分母の `reactive_stmt` が動いた**結果。集計 15.9%（epic の値）も生き残る。
→ **リビジョン差の疑いは論点として消滅した**（carbon の当時の pin は
リポジトリにも計測ノートにも記録がなく、file 数 287 しか残っていない。
`corpus-sources.json` はアプリコーパスを持たない。ただし**もう照合不要**）。

**★ `$:` 密度モデルは反証された（予測を先に記録した上で外した）★**
「`$:` 1 文の単価は一定」と仮定すると密度 d から reactive_share が決まるはずで、
open-webui を測る前に **d=2〜3% なら pa_rest 81〜87%** と予測を記録した。
実測は **d=7.66%（588/7680）で pa_rest 91.4%** — 同じモデルは d=7.66% で
**62%** を予測する。**外れ幅 29 ポイント。**
`$:` は密度でなく**絶対本数と compile 全体の比**でしか効かない
（carbon 765 本 / 291 files で reactive 19.3%、open-webui 588 本 / 650 files で 1.9%）。

**再発防止（2 つ）**:
1. 母集団 A で測った数値が母集団 B で再現しないことは、**その数値の棄却ではない**。
2. **導出量（比）の不一致を、分子の不一致と読むな。** 分母を先に並べること。

### ★ 段別内訳（min over n=6 の**推定値**。compile 比。corpus 名を必ず添えること）★

> **これはシェアなので上界ではない。** 分母（total compile）は全ステージの
> 汚染を吸うが分子は自分の分しか吸わないので、**各行は過小評価の可能性が高い**。
> 上界と書けるのは ms の列だけ。

| stage | smelte | carbon/src | open-webui |
|---|---|---|---|
| `reactive_stmt` | **14.86%** | **9.83%** | 2.18% |
| `stores` | 0.14% | 0.37% | **2.41%** |
| `state_assigns` | 1.09% | 1.42% | **2.12%** |
| `legacy_state_declarations` | 0.64% | 0.66% | 1.54% |
| `state_reads` | 0.76% | 1.15% | 1.38% |
| **`export_let`** | **3.51%** | 1.94% | 0.51% |
| `prop_assignments` | 1.65% | 1.80% | 0.92% |
| `member_mutations` | 0.65% | 0.43% | 0.73% |
| （参考）min total compile | 27.51ms | 350.96ms | 1654.75ms |

**★ min 推定量は「アプリ 2 本で 1 位が排他」を消した ★**
`reactive_stmt` は smelte / carbon で 1 位、open-webui でも 2 位（首位と 0.2 点差）。
**「1 位の行が入れ替わる」は汚染そのものだった** —
open-webui で首位に見えていた `member_mutations` は
min 12.108ms / max 100.579ms（spread 8.31x）で、**max 側が汚染**。
min では 7 位（0.73%）まで落ちる。
**推定量を変えたら 3 コーパスの描像が一致した**のは、推定量が効いている証拠。

### ★★ 【撤回】以下 2 節の順位づけは単発 run 由来で、成立していない ★★

> **撤回理由**: 下の 2 つの表（アプリ 2 本の 1 位入替、compile 比の上位行）は
> **各コーパス 1 run** のシェアで作った。上の 6 連続 run で判明した通り、
> carbon の `export_let` は単独で **17.45 倍**、open-webui の
> `rest_prop_member_access` は **30 倍**のレンジを持つ。
> **「10〜11 倍の排他」はコーパス内の run 間ばらつきの内側**であり、
> コーパス間の差として読めない。表は経緯として残すが**数値を引用しないこと**。
>
> **生き残るのは**「`state_assigns` は両アプリで大きい」という**弱い順序主張**だけで、
> それも n=6 のレンジで確認していない。

実出荷アプリ 2 本で **1 位の行が入れ替わる**（compile 比）:

| stage | carbon/src | open-webui | 比 |
|---|---|---|---|
| **`reactive_stmt`** | **19.34%** | 1.92% | **10.1x**（carbon 側） |
| `state_assigns` | 6.04% | 4.65% | 1.3x ← **両方で大きい唯一の行** |
| **`member_mutations`** | 0.50% | **5.59%** | **11.2x**（open-webui 側） |
| `stores` | 0.53% | 2.71% | 5.1x |
| `legacy_state_declarations` | 0.72% | 2.55% | 3.5x |

**1 位は排他（10〜11 倍）、2 位は共有。** 「4 ステージの和が open-webui で
15.5%、carbon では僅か」という言い方は**行き過ぎ** — 実際は 7.79% vs 15.50% の
**2.0 倍**で、差の大半は `member_mutations` 単独が作っている。
正確な形は「**1 位の行だけが排他で、2 位の `state_assigns` は両方に効く**」。

### 上位行（★ compile 比。親比の表は捨てた ★）

| stage | smelte | svelte-ux | **carbon/src** | **open-webui** |
|---|---|---|---|---|
| `reactive_stmt` | **14.75%** | **8.20%** | **★19.34%★** | 1.92% |
| `member_mutations` | 2.51% | 2.32% | 0.50% | **★5.59%★** |
| `state_assigns` | 3.91% | 1.34% | **6.04%** | **4.65%** |
| `stores` | 0.55% | 1.30% | 0.53% | **2.71%** |
| `legacy_state_declarations` | 2.30% | 3.20% | 0.72% | **2.55%** |
| `state_reads` | 2.78% | 4.03% | 1.21% | 1.29% |
| **`export_let`** | 3.49% | 1.38% | 1.95% | **0.53%** |
| `prop_assignments` | 6.06% | 4.62% | 1.95% | 1.03% |

**ランキングが親比の表と全く違う。** `export_let`（親比では単独首位だった）は
compile 比では **0.53〜3.49%**。実出荷アプリで最大の 1 行は
carbon が `reactive_stmt` 19.3%、open-webui が `member_mutations` 5.6%。
**2 つのアプリで首位行が違う**ので、単一の「次の標的」は現時点で立たない。

open-webui の 4 行（`member_mutations` + `state_assigns` + `stores` +
`legacy_state_declarations` = 15.5%）は同一 run 内で `prop_source_reads` の
**9.5 倍**あり、smelte では `member_mutations` は `prop_source_reads` **より安い**。
**同一 run 内で順位が逆転する**ので負荷では説明できない。
文サイズ（open-webui 220B/文 vs smelte 69B/文）と状態変数集合の大きさの
**積**でスケールしている疑い（[S]、未測定）。

**★★ 【撤回】「順位逆転は負荷で作れない」は反証された ★★**
「同一 run 内の 2 行の順位は負荷では動かない」と主張したが、**誤り**。
`member_mutations` vs `prop_source_reads` を 6 連続 run で判定すると:

| corpus | member が高い run | 比のレンジ |
|---|---|---|
| smelte | **0 / 6** | 0.45–0.61 |
| carbon/src | **0 / 6** | 0.04–0.36 |
| **open-webui** | **4 / 6** | **0.34–5.12（15 倍）** |

**open-webui では順位そのものが run 間で反転する。** 元の主張は
open-webui の **n=1** に基づいていた。順位比較は比較較より頑健だが
**十分ではない** — 摂動がステージ単位なら順位も動く。

**★ 判別実験の設計（積モデル vs 文サイズ単独モデル）★**
このコーパスでは**文サイズと変数集合サイズが相関している**ので、
両モデルとも同じデータに fit する。**`bytes/call` は既に積なので判別力ゼロ。**
判別するには**片方を固定する**しかない:

> 呼び出しを**変数集合サイズでバケット分け**し、**バケット内**の `ns/byte` を見る。

必要な計器は「タイマの隣にもう 1 本のカウンタ」＝
`state_vars.len() + store_sub_vars.len() + prop_assignment_transform_vars.len()`
をバケット化して `(time, bytes, calls)` を別々に積む。既存の `record_pa` の
インデックスを `stage × bucket` に広げるだけで済む。ガードと `other` 行は
そのままなので**被覆チェックはバケットごとに閉じる必要がある** ＝ 従来より強い制約。

#### ★ 事前登録（走らせる前に書く。密度モデルと同じ手順）★

**結果の 3 通りを先に固定する:**

| 観測 | 結論 |
|---|---|
| バケット**内**で `ns/byte` 平坦・バケット**間**で上昇 | **積モデル** |
| バケット**内**でも上昇 | **文サイズ単独**が担う |
| **セルが薄くて区別できない** | **`unmeasured`**。★「平坦」と読むな★ |

**第 3 の結果を明示的に持つこと。** 薄いバケットは「平坦」に見えるので、
これを書いておかないと積モデルの偽陽性になる。

**最小セル数 n ≥ 200 calls。** 下回る `(stage × bucket)` セルは
**`unmeasured` と報告し、隣のバケットに畳み込まない**（畳み込みは
まさに判別したい 2 変数を再び混ぜる操作）。
現在の `member_mutations` の call 数は
smelte 298 / sveltestrap 600 / svelte-ux 712 / **carbon 3670 / open-webui 4950**。
→ **バケット試験が成立するのは carbon と open-webui だけ**。
小さい 3 つは全 call が 1 バケットに集中した場合にのみ 1 セル分使える。

**交絡の事前チェック（これを先に見る）**: 変数集合サイズと文サイズ自体が
相関しているなら、「バケット間で上昇」は**両モデルと整合**してしまい、
試験は必要なところで判別力を失う。よって**各バケットの `bytes/call` を併記し、
比較対象バケット間で `bytes/call` が 1.5 倍を超えて動いたら
「バケット間比較は判別力なし」と宣言する**。
その場合の判別比較は**バケット間ではなく、同一バケットのコーパス間** —
**変数集合サイズを揃えた上で文長だけが違う 2 点**を比べる
（carbon 対 open-webui。smelte は上の call 数制約から 1 セルしか作れない）。

**★ 検出力の事前計算（作る前に 10 分で出す。結論: carbon では成立する）★**

「シェアが 17〜30 倍ばらつくから判別実験は死ぬ」と一度書いたが、**誤り**。
ばらつくのは**シェア**であって、判別に使う **1 ステージの ns/byte** ではない。
`member_mutations` の ns/byte を 6 run で見ると:

| corpus | ns/byte レンジ | spread | 非重複に必要な効果量 |
|---|---|---|---|
| smelte | 8.7–16.3 | 1.88x | >1.88x（ただし call 数不足で 1 セルのみ） |
| **carbon/src** | **3.5–5.8** | **1.66x** | **>1.66x → 実現可能** |
| open-webui | 11.1–92.5 | 8.31x | >8.31x → **ほぼ不可能** |

積モデルが真なら ns/byte は変数集合サイズに比例して伸びるはずで、
バケットが 2 変数 ↔ 20 変数を張るなら効果は数倍〜10 倍。
**carbon では要求 1.66 倍 < 期待効果**なので**検定は成立する**。
open-webui は要求 8.31 倍で**成立しない**。

**★ ただし 1.66x は下界である ★**: バケット別セルは
ステージ全体より call 数が少ないので、セルの spread は
**全体の spread 以上**になる。したがって
「要求効果 > 1.66 倍」は**楽観側の見積り**であり、
実測されたセルごとの spread で再確認すること。

**注意（規模と機序は別問題）**: carbon は `member_mutations` が
compile 比 ~0.5% しかないコーパスなので、ここで積モデルが確認できても
**「機序が分かった」であって「大きい標的が見つかった」ではない**。

### ★★★ このプロファイラで成立する検定は「符号検定」だけ ★★★

**ステージ間比較で使えるのは、多数のペア run を取って
「どちらが大きかったか」を数え、勝率を報告することである。**
シェアでも比でも min/max でもない。**符号。**
ステージ単位の摂動は**大きさ**（比・シェア）を壊すが、**向き**は壊さない —
壊すには摂動が特定ステージに系統的に偏っている必要があり、それはより強い主張で、
かつ検定可能。キャンペーンのペア A/B 規律そのものだが、
**ステージ比較に適用していなかった**。

**`export_let` の単価: 18 run（3 コーパス × 6）のペア符号検定**

| 比較 | 勝ち/全 | p（両側） | 内訳 |
|---|---|---|---|
| `export_let` > `prop_source_reads` | **18/18** | 0.00001 | 6/6, 6/6, 6/6 |
| `export_let` > `state_assigns` | **18/18** | 0.00001 | 6/6, 6/6, 6/6 |
| `export_let` > `state_reads` | **18/18** | 0.00001 | 6/6, 6/6, 6/6 |
| `export_let` > `member_mutations` | **18/18** | 0.00001 | 6/6, 6/6, 6/6 |
| `export_let` > `destructure_assignments` | **18/18** | 0.00001 | 6/6, 6/6, 6/6 |
| `export_let` > `legacy_state_declarations` | **18/18** | 0.00001 | 6/6, 6/6, 6/6 |
| `export_let` > `prop_assignments` | **17/18** | 0.00014 | 6/6, **5/6**, 6/6 |

**`export_let` は連鎖内の全兄弟より 1 バイトあたり高い。** 単価は
**77.8–200.3 ns/byte**（30〜34 バイトの 1 文に 2.6–4.0µs）。
★ carbon の 1 run は `export_let` が 1727.9 ns/byte（14 倍の外れ値）だが、
**符号検定はこれを「1 勝」としか数えない** — 比を破壊する外れ値が
符号を破壊しないことが、この検定を使う理由そのもの。

**「兄弟の 3.6〜14 倍」という言い方は完全に廃止**（撤回として残すのではなく削除）。
倍率は run 間ノイズで、確立していない。原因は
`transform_export_let` → `state_pipeline_ast` の AST パスが 1 文ごとに走ること。

**★ 陰性対照: 同じ検定が撤回済みの「順位逆転」を殺す ★**

| 比較 | smelte | carbon | open-webui |
|---|---|---|---|
| `member_mutations` > `prop_source_reads` | 0/6 (p=0.031) | 0/6 (p=0.031) | **4/6 (p=0.69)** |

open-webui は**有意でない**（＝逆転は確立しない）。
一方 smelte と carbon は**逆向きに有意**（member の方が安い）。
**同じ計器が一方の主張を支持し、他方を殺す** ＝ 判別力がある。

### ★ 最適化 1: `transform_state_pipeline_ast` の allocate-then-bail ★

**決定論カウンタで確定（時間ではない）**: `effective_read_names`
（`Vec<String>`、state var ごとに 1 clone）は**2 つの early-out より前**で
構築されていた。実測:

| corpus | calls | 第 1 ゲートで bail | **無駄な String clone** |
|---|---|---|---|
| carbon/src | 1770 | **1770 (100.0%)** | **16807** |
| smelte | 700 | **700 (100.0%)** | **2368** |

**両コーパスで bail 率 100%** ＝ この割り当ては**常に捨てられていた**。
修正は構築を第 1 ゲートの後ろに移すだけ（`effective_read_names` は
第 2 ゲート以降でしか読まれないので出力に影響しない）。

**★ 規模の正直な見積り: 小さい ★** 16807 clone × ~30–50ns ≈ 0.5–0.8ms、
carbon の総コンパイル 351ms に対し **~0.2%**。
**総コンパイル時間の符号検定では検出できない。**
したがってこの修正の根拠は**タイミングではなくカウンタ**であり、
「16807 回の無駄な確保が 0 になる」という主張以上のことは言わない。

### ★★ `export_let` の深掘り: 結論は「小さい標的」。ここで打ち切る ★★

**まず判別実験が成立するかを先に確かめた（そして最初の案は死んだ）**

「`el:state_pipeline` の ns/byte が兄弟より高ければ per-call コスト」と
書いたが、**これは判別しない** — bytes を固定すると
「per-call で高い」と「per-byte で高い」は**同じ観測**になる（共有性質の罠）。
正しい判別は **bytes/call を振ること**:

```
per-call 支配 → time/call がコーパス間で一定、time/byte が動く
per-byte 支配 → time/byte が一定、time/call が動く
```

**実コーパスではこの実験ができない**: `export_let` の bytes/call は
smelte 33.6 / sveltestrap 29.2 / svelte-ux 34.2 / carbon 32.8 /
open-webui 31.3 ＝ **1.17 倍しか動かない**（`export let foo = undefined;` が
支配的なので当然）。**振れない量で判別しようとしていた。**

**そこで合成コーパスで意図的に振った**（call 数を 1000 に固定、文長だけ変える）:

| arm | bytes/stmt | export_let µs/call | ns/byte |
|---|---|---|---|
| short | 23.9 | **2.12** | **82.0** |
| long | 819.9 | **10.58** | **12.9** |

bytes が **31.7 倍**でも時間は **5.0 倍**しか増えない ＝
**どちらの仮説も純粋には成り立たない。** 2 点フィット `t = a + b·bytes`:

| stage | 固定 a (µs/call) | 限界 b (ns/byte) | carbon 実寸 32.8B での固定分 |
|---|---|---|---|
| **`export_let`** | **1.847** | 10.63 | **84%** |
| `transform_export_let` | 0.570 | 5.81 | 75% |
| `apply_prop_reads_in_prop_default_values` | 0.992 | 4.69 | 87% |
| `state_pipeline` / `store_reads` | ~0.02 µs 合計 | — | — |

**★ 実寸（~32 バイト）では 84% が per-call 固定費 ★**
内訳は `prop_reads_in_defaults` 0.99µs + `transform_export_let` 0.57µs。
18/18 の符号検定（「兄弟より 1 バイトあたり高い」）は**正しかったが、
機序は「固定費を小さいバイト数で割っている」だった。**

### ★ 結論: `export_let` は「単価は高いが母集団が小さい」標的。撤退する ★

- 1 call **4.1µs**（carbon 実測）、全兄弟より per-byte で高い（18/18, p≤0.00014）
- **しかし carbon の compile 比 1.94% / smelte 3.51%（min over n=6 の推定値。
  シェアなので上界ではなく、むしろ過小評価寄り）**
- carbon で扱うバイト数は **54,645**。対する `prop_source_reads` は **432,750**

**★ ただし「上限 ~2%」とは書けない ★**
1.94% / 3.51% は**シェア**であり、min の下でシェアは上界にならない（上記の規則）。
むしろ分母が余分に汚染を吸う分、**過小評価寄り**である。

**★★ 退役の根拠は符号検定であって、シェアでも仮定でもない ★★**
一度「両ステージとも同じ向きのバイアスだから順位は保たれる」と書いたが、
これは**仮定**である。バイアス `δs/s` は**ステージごと**であり
（それがステージ単位摂動という発見の中身そのもの）、
**符号が同じことは大きさが同じことを意味しない。**
`reactive_stmt` の方が汚染の主吸収源に近ければ相対膨張は大きく、差は縮む。

そこで**分母を一切使わない検定**にした ＝
**同一 run 内の絶対時間で `reactive_stmt` vs `export_let` のペア符号検定**:

| corpus | 勝ち/全 | p | 比のレンジ |
|---|---|---|---|
| smelte | **6/6** | 0.031 | 4.0–5.5x |
| carbon/src | **5/6** | 0.219 | 5.1–16.2x（+ 1 敗） |
| open-webui | **6/6** | 0.031 | 4.3–12.0x |
| **合計** | **17/18** | **0.000145** | |

**唯一の敗北は carbon run 2** — `export_let` が 1727.9 ns/byte を記録した
**独立に外れ値と判定済みの run** と同一。
（**これは除外の根拠にはしない**。17/18 はその run を含めた値。）

★ この検定は既出の 18/18 とは**別の問い**である:
あちらは **per byte（単価）**、こちらは **絶対時間（総量）**。
単価で圧勝しつつ総量で負けるのは矛盾ではなく、
まさに `export_let` について言っている話そのもの。

**高い単価 × 小さい母集団は、それ自体が報告に値する形**である。
証拠つきで標的を**退役**させる — 将来の調査者が再導出しないように。
努力は `reactive_stmt` に向けること（min では 3 コーパス全てで首位）。

### ★★★ span 有効率は母集団依存。「89.5%」も「blocker = arrow_parens」も単独では偽 ★★★

text→AST 移行の前提（Phase 2 の span が `line_loop` まで生き残る率）を
**実測**した（コードを読んで導出したものではない）。判定は
「pipeline 入口のテキスト == `line_loop` 入口のテキスト」の**厳密比較**。

| corpus | 種別 | staged files | text 変化 | **span 有効率** | `rehome` 変化 | `arrow_parens` 変化 |
|---|---|---|---|---|---|---|
| shadcn-svelte | lib(runes) | 1133 | 6 | **99.47%** | 0 | 6 |
| flowbite | lib | 832 | 22 | **97.36%** | 0 | 20 |
| **bits-ui** | **lib** | 605 | 167 | **★72.40%★** | **0** | **167** |
| carbon/src | app | 351 | 38 | **89.17%** | **37** | 4 |
| open-webui | app | 733 | 48 | **93.45%** | **34** | 14 |

**★ 「blocker は rehome であって arrow_parens ではない」は撤回する ★**
これは**コーパスをまたいだ比較**（本リポジトリで禁止されている手）だった。
実際は**どちらも自分の母集団では正しい**:

- **ライブラリでは `rehome` が 3 コーパスとも変化 0 件** ＝ blocker は
  `arrow_parens` 単独。bits-ui は変化 167 件が**全て** `arrow_parens`。
- **アプリでは `rehome` が支配的**（carbon 37 / open-webui 34）。
  `rehome` は `$:` に対して発火するので、legacy `$:` 密度が
  アプリ 68.9% : ライブラリ 12.3%（バイト比 5.6 倍）である以上、当然の分岐。

**★ 「89.5%」は定数ではない — 実測は 72.40% 〜 99.47% ★**
最悪値 **bits-ui 72.40%** は**ライブラリ**であり、「ライブラリなら安全」でもない。
**移行計画をこの 1 つの数値に紐付けてはいけない。母集団ごとに出すこと。**

**帰結（計画の分岐）**:
- **ライブラリ**: `arrow_parens` を消せば span 有効率は
  flowbite 97.36→~99.6% / shadcn 99.47→100% / **bits-ui 72.40→100%**。
  esrap 印字化で `strip_unnecessary_arrow_body_parens` が消えるという
  当初の前提は**ライブラリでは正しい**（bits-ui では効果絶大）。
- **アプリ**: carbon は 89.17→~90.3% にしかならない。
  **★ 印字の移行だけでは legacy 濃厚なアプリを解けない ★**

**★★ 2 つの作業項目は独立ではない（両担当とも知らなかった）★★**
`rehome_reactive_statement_comments` は印字の産物ではなく、
**upstream が `$:` を `legacy_pre_effect` に作り替えることの模倣**である。
したがって**アプリ側の blocker を外すのは reactive-statement 移行の側**
（＝ `rs_deps` 担当の作業項目）であり、
**script 印字移行はそれに依存する**。独立計画として扱わないこと。

### ★ `arrow_parens` の自己消滅は検証済み（コード読みではなく実行）★

「esrap は冗長な括弧を自動で落とすので、script 印字が AST 化すれば
`strip_unnecessary_arrow_body_parens` は存在理由を失う」という前提は
**11.0 点を出したのと同じコード読みの出所**だったので、**公式コンパイラ
（＝ esrap）に実際に食わせて確認**した:

| 入力（arrow body） | 公式出力 | 判定 |
|---|---|---|
| `() => (a + b)` | `() => a + b` | **落とす** |
| `() => (doThing())` | `() => doThing()` | **落とす** |
| `(x) => (x ? 1 : 2)` | `(x) => x ? 1 : 2` | **落とす** |
| `() => (obj.prop)` | `() => obj.prop` | **落とす** |
| `async () => (await g())` | `async () => await g()` | **落とす** |
| `() =>(a + b)`（空白なし） | `() => a + b` | **落とす** |
| `export let cb = () => (a + b)` | `$.prop(..., () => a + b)` | **落とす** |
| `() => (() => 1)` | `() => () => 1` | **落とす** |
| `() => ({ a: 1 })` | `() => ({ a: 1 })` | 保持（**構文上必須**） |
| `() => (a, b)` | `() => (a, b)` | 保持（**構文上必須**） |

**除去可能な形は全て除去され、必須の 2 形だけが保持される** ＝ 前提は正しい。

**★ 自分の検出器の欠陥 ★**: 当初 `=>\s*\(` で判定していたため
`() => () => 1` を「保持」と誤判定した（内側 arrow の**空引数リスト** `()` に
マッチしていた）。**判定器が対象と無関係な文字列に当たる**典型。

**構造的な裏付け（[S]）**: コーパスゲートは 14,136 entry で
rsvelte 出力 == 公式出力（js-mismatch 0）を保証しており、bits-ui も含む。
つまり**現在のテキストパスは既に esrap と同一の括弧結果を出している**ので、
印字を esrap に替えても出力は変わらない ＝ パスは不要になる。

**★ 残る条件を実測した（自分の規則を自分の数値に適用）★**
「libraries → 100%」も applicability の数値なので、**走らせずに出せば
invoked を数えることになる**。よってフォールバック集合を実測した
（`RSVELTE_CLIENT_TO_OXC_DEBUG=1`。既存の計器で、追加実装は不要だった）:

| corpus | files | text 印字へ fallback | 率 | 理由 |
|---|---|---|---|---|
| bits-ui | 617 | **16** | 2.59% | 全て `chunk-parse` |
| flowbite | 1296 | **50** | 3.86% | 全て `chunk-parse` |

**★ 決定的: 重なりは 0 ★**
bits-ui の fallback 16 ファイルのうち、`=> (` / `=>(` を含むものは **0 件**。
判定は**ファイル全体**への grep ＝ script 部分の**上位集合**なので、
上位集合が 0 なら script 部分も 0（方向は健全）。さらに invoked ⊇ changed なので
**changed との重なりも 0**。

→ `arrow_parens` が実際にテキストを変える **167 ファイルは全て esrap で印字される**。
したがって **bits-ui の 72.40% → 100% は成立し、パスは完全に自己消滅する**。

**なぜ bits-ui で測ったか**: 効果が最大（72.40→100%）で、かつ
`arrow_parens` の変更が最も密（167 件）＝ **2 つの母集団が重なるなら
ここで重なる**。shadcn（余地 0.5 点）で測っても判断は動かない。

### ★★★ 未検証の含意: このパスは「移行後」ではなく **今すでに** 冗長かもしれない ★★★

`to_oxc` は `JsStatement::Raw` を**そのまま印字していない** —
`parse_chunk`（`to_oxc.rs:1269`）で **oxc AST に再パースし、esrap で印字する**。
`chunk-parse` はその**パース失敗**時のフォールバック理由である。

**★★ エピックの形が変わる: 「script 印字の AST 移行」は完了済みか誤名 ★★**
残っているのは**印字側ではなく変換側**である —
`line_loop` とその前段（prenormalize / collect_vars）が
依然としてテキストを操作している。計画書の
「script 印字を AST に移行する」という項目は、
**すでに `parse_chunk` + esrap で達成されている**か、
**`line_loop` のテキスト変換撤去を指す誤った名前**のどちらかであり、
**この 2 つは規模も難度も全く違う**。計画を読む人が
前者を残作業だと思い込む形になっているので、名前を直すこと。

→ **client の script 印字は既に AST + esrap** であり、
「script 印字が AST 化したら `strip_unnecessary_arrow_body_parens` は
存在理由を失う」という条件は、**フォールバックしない 97.4% では既に成立している
可能性がある**。つまりこのパスは移行を待つ必要がなく、
**今日削除できる死んだコードかもしれない。**

**★ ただしこれは推論であって未検証 ★**。反対材料もある:
`to_oxc.rs:35-39` は「パースが**通っても**印字が元テキストと変わりうる」と述べ、
`restore_legacy_pre_effect_deps` / `restore_single_target_destructure_sequences`
が**まさにその補正のために存在する**。`arrow_parens` も同種の補正を
**事前パスの形で**行っているだけ、という可能性がある。

**判別実験（設計済み・未実行）**: パスを恒等写像にして
byte-identity ゲート（`runtime` / `validator` / `compiler_fixtures` / `ssr`）を回す。
- 出力不変 → **今すぐ削除できる**（移行と独立の小さな勝ち）
- 出力変化 → パスは現役。変化したファイルが `restore_*` と同じ種類かを見る

**実行できていない理由**: 別エージェントの `cargo test -p rsvelte_core` が
cargo ロックを保持しており、**ゲート実行中にソースを編集すると
「途中で入力が変わったゲート」になる**（本セッションで 1 度やって無効化した）。
ロックが空くまで編集しないこと。

#### ★ 事前登録: どの母集団でゲートするか（結果を見る前に確定させる）★

**「動かなかった」を読む前に「動きうる」ことを示す** — 計器テスト規則の 1 段上。
各母集団で `arrow_parens` が**実際にテキストを変える**ファイル数（実測済み）:

| 母集団 | staged | **`arrow_parens` changed** | 判別力 |
|---|---|---|---|
| bits-ui（コーパスゲート内） | 605 | **167** | ★強い★ |
| flowbite（同上） | 832 | **20** | 強い |
| shadcn（同上） | 1133 | 6 | 弱い |
| **fixture: runtime-runes** | 1010 | **4** | **薄い** |
| **fixture: runtime-legacy** | 1405 | **2** | **薄い** |

**→ Rust fixture スイート 2 つ合計で 6 ファイルしかない。**
0 ではないので「動きえない」わけではないが、**薄い**。
fixture ゲートが緑でも「このパスを踏む形が fixture に無い」と
区別がつかない可能性が残る ＝ **必要条件であって十分条件ではない**。
**判定は 14,136 entry のコーパスゲート（bits-ui 167 件を含む）で行うこと。**

#### ★★ fixture コーパスの歪みは「量」ではなく「どれが効くか」にも及ぶ ★★

既知の歪みは **legacy 3 倍・失敗率 16 倍** ＝ いずれも**量**の話だった。
今回出たのは**種類**の話である:

| 母集団 | 最大の prenormalize 変換 | `class fields` inv/chg |
|---|---|---|
| fixture runtime-runes | **`class fields`** | **60 / 55** |
| 実出荷 5 コーパス（lib/app 両方） | `rehome` または `arrow_parens` | **0 / 0** |

**fixture で「最も効いている変換」は、実出荷では 1 件も発火しない。**
量の歪みは倍率で割り引けるが、**種類の歪みは割り引けない** —
fixture でゲートした最適化は、**実出荷に存在しない仕事**を対象にしうる。
fixture をゲートに使う場合は、**対象の変換が実出荷で何件動くかを
必ず併記すること。**

#### ★ ツールの母集団も確認した（`.svelte.ts` 除外の罠）★

`corpus_hash` は `.svelte.ts` を除外するため、対象が `.svelte.ts` に
偏っていれば**構造的に空の母集団に対して IDENTICAL を報告する**。
bits-ui は `.svelte.ts` にロジックが多いので確認した:

- **`strip_unnecessary_arrow_body_parens` の呼び出し箇所は 1 つだけ**
  （`client/mod.rs:4719`、`transform_instance_script_for_visitors` 内）＝
  **`.svelte` の instance script 経路のみ**。`.svelte.ts` モジュールは通らない。
- `compile_profile` の収集も `extension == "svelte"` のみ。
- → **167 件は全て `.svelte`。`corpus_hash` の除外はこの実験には効かない。**

**★ ただし自分の計器の射程も同じ形で限定されている ★**:
bits-ui には `=> (` を含む `.svelte.ts` が **30 件**あるが、
本節の測定は**一度もそれを見ていない**。
「bits-ui 72.40% → 100%」は **`.svelte` 母集団についての主張**である。

#### ★ 結果の読み方も先に決めておく ★
- **出力不変**（コーパスゲートで）→ パスは**今日削除できる**。
  移行不要・フォールバック risk なし・ゲートで出力中立が証明済み。
- **出力変化** → 「パスは現役、以上」で終わらせない。
  **変化したファイルを列挙し**、`restore_legacy_pre_effect_deps` /
  `restore_single_target_destructure_sequences` と**同じ族か**を判定する。
  round-trip 補正であることと、テキストパイプラインの遺物であることは
  **別の結論**であり、次の作業項目が変わる。

### ★★ 規則: 判定器には先に「答えを知っている入力」を両方向で通す ★★

`=>\s*\(` の欠陥（内側 arrow の空引数リストに誤マッチ）が見つかったのは
**その行だけが予想と食い違ったから**である。予想と一致した 9 行は
**一切検査していない**。これは注意力の問題ではなく**構造的な偏り**:

> **意外な結果を出す計器バグは監査される。予想通りの結果を出す計器バグは
> 不可視である。そして予想通りの結果の方が多数派なので、
> バグ質量の大半は誰も見ない側に溜まる。**

対策は「もっと多くの行を監査する」ではない（スケールせず偏りも残る）。

> **判定器は、問いに向ける前に、答えが分かっている入力を
> 両方向（陽性・陰性）で通すこと。そしてそれらを「結果」ではなく
> 「計器テスト」として明示的に名前を付けて記録すること。**

今回、必須括弧の 2 行（`() => ({a:1})` / `() => (a, b)`）が偶然
陰性対照として働いたが、**あれは結果の行がたまたま既知だっただけ**で
計器テストではない。**全行が除去可能な形だったら、欠陥は
「全部 drops」というきれいな結果を出し、そのまま出荷されていた。**

### ★★ 規則: applicability を「ガード条件を読んで」出すな ★★

**ガード条件から導いた数値は invoked を数える。span を壊すのは changed だけ。**
実測の乖離は **6.2x（carbon の `rehome`）/ 6.9x（flowbite の `arrow_parens`）**。
したがって**実行せずに出した適用率は最大その倍率だけ上振れしている**。
これはコーパスに依らない一般則であり、本件固有の脚注ではない。

### ★ 「invoked」と「changed」は別物（元の数値が出た機序）★

| corpus | `rehome` invoked/changed | `arrow_parens` invoked/changed |
|---|---|---|
| carbon/src | **230 / 37** (6.2x) | 25 / 4 |
| flowbite | 2 / 0 | **138 / 20** (6.9x) |
| shadcn | 11 / 0 | 12 / 6 |

**ガード条件を読んで導出した数値は invoked を数える**（構造上そうなる）。
実際に span を壊すのは **changed** だけで、差は最大 **6.9 倍**。
**「発火する」と「テキストを変える」を区別しない見積りは、上振れする。**

### ★ 恒等式の検査自体が間違っていた ★
当初の検査は `text_changed == Σ(per-transform changed)` だったが、
**2 つの変換が同じファイルを触ると Σ 側が二重計上**するので、
良性の理由で失敗する（carbon 38 vs 41）。
**ファイル単位の「いずれかが変えた」フラグ**に置き換えたところ
**5 コーパス全てで HOLDS**（carbon の超過 3 は二重計上と確認）。
`37 + 4 − 3 = 38` という算術的整合を「検証」と呼ばないこと。

### runes 極で唯一実在するコストは `destructure_assignments`（2 コーパスで一致）

**⚠ この節も単発 run 由来。n≥6 で再測していない。**
shadcn: `process_accum` の **34.4%**（1950 calls × 1.05µs）。
SMUI: **51.9%**（1617 calls × 1.58µs）。他の行は軒並み
0.02–0.05µs/call ＝ **計器そのものの床**（較正値 43–95ns/pair）なので読めない。
床との比（20〜50 倍）は上のばらつき（最大 30 倍）と同程度なので、
**「床より明確に上」と言い切るには n≥6 のレンジが要る**。
`destructure_assignments` はその 20–50 倍で、明らかに実仕事をしている。
**独立した 2 つの runes コーパス（lib と app）で同じ行が立つ**のが唯一の補強。

**構造的説明（[S]、判別測定ではない）**: この連鎖で `!analysis.runes` ガードを
持たない唯一のステージがこれ。ガードは
`state_vars.is_empty() && store_sub_vars.is_empty() && prop_assignment_transform_vars.is_empty()`
だけで、runes モードでも `$state` 宣言があれば `state_vars` は空にならない。
兄弟ステージが全て AST パスに遅延しているのに、これだけ 1 文ごとに走っている疑い。
**次の作業はこれを判別する測定から**（「runes かつ 3 ベクタ非空」の件数を数える）。

### `other` は残差ではなく計器である

legacy 4 コーパスで `other` は親の 2.1–3.4%、runes 2 コーパスで 20.9–24.6%。
shadcn の `other` 1.469ms は ON−OFF 差 1.44ms とほぼ一致する ＝
**未計装の残りはほぼゼロで、`other` の中身は計器のコスト**。
つまり分割は `process_accum` をほぼ全量カバーしている。
逆に言えば **runes 極の 1〜2% バケットは計器に支配されていて、段別には読めない**。

**`PA-OVERHEAD` 行自体を信用しすぎないこと**: 較正は同一プロセス内だが
較正ループ自体が負荷を受ける。carbon/src の run では 330.8ns/pair（他 run は
43–95ns）と出て、上界 27.4ms が実測 `other` 2.66ms を 10 倍上回った。
**`other` の方が上界より締まっている**ので、被覆の主張は `other` で行うこと。
