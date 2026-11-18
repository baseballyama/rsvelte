<script lang="ts">
	import DataStructures from './DataStructures.svelte';
	import ParseSharingFigure from '#lib/widgets/ParseSharingFigure.svelte';
	import ProjectFactsFigure from '#lib/widgets/ProjectFactsFigure.svelte';
	import SvelteSourceFigure from '#lib/widgets/SvelteSourceFigure.svelte';
	import { REPO_URL } from '#lib/site.ts';

	let { data } = $props();

	const sections = [
		{ id: 'whole-file', label: 'テンプレートの解析' },
		{ id: 'extensions', label: '独自のコード検査ルール' },
		{ id: 'sharing', label: '解析結果の共有' },
		{ id: 'project', label: 'ファイルをまたぐ最適化' },
		{ id: 'today', label: '実装状況' },
	];
</script>

<svelte:head>
	<title>rsvelte を作る理由 — rsvelte</title>
	<meta
		name="description"
		content="Svelte のテンプレートを含む解析、独自のコード検査ルール、処理の間での解析結果の共有、ファイルをまたぐ最適化。rsvelte が解決したい問題と、今の実装範囲を説明します。"
	/>
</svelte:head>

<main class="why">
	<header class="intro">
		<p class="eyebrow">プロジェクトの目的</p>
		<h1>rsvelte を<br />作る理由</h1>
		<p class="lead">
			rsvelte は、Svelte の構文木と名前解決の結果を、コード検査・整形・コンパイル・型検査で共有する
			Rust
			製のツールチェーンです。テンプレート内の変数の参照やバインディングまで解析した結果を、独自のルールやコンパイラから使えるようにします。
		</p>
		<p>
			まずは Svelte 5 の runes
			モードを対象にします。構文解析、解析結果のキャッシュ、タスク（コンパイルや整形などの処理の単位）の登録と実行を、ツールの間で共通にします。これで、ツールごとの再解析と、独自ルールごとに書く解析処理を減らします。実装は実験段階です。
		</p>
		<div class="premise">
			<span>このページの前提</span>
			<p>
				04
				のファイルをまたぐ最適化は、まだ設計だけで実装していません。このページの図は、データの依存関係と判断の条件を示すモデルで、実測値ではありません。
			</p>
		</div>
	</header>

	<nav class="contents" aria-label="このページの目次">
		{#each sections as section, index}<a href="#{section.id}"
				><span>0{index + 1}</span>{section.label}</a
			>{/each}
	</nav>

	<section id="whole-file">
		<p class="eyebrow">01 · 言語の対応範囲</p>
		<h2>Oxlint は Svelte の<br />テンプレートを解析しない</h2>
		<p>
			Svelte では、スクリプトで宣言した変数をテンプレートから参照できます。下の例では、式 <code
				>&#123;name&#125;</code
			>
			が変数を読み、<code>bind:value=&#123;name&#125;</code> は入力のたびに変数へ書き込みます。この関係を解析するには、JavaScript
			の構文木に加えて、テンプレートの構文木と名前解決が必要です。
		</p>
		<SvelteSourceFigure markup={data.examples} />
		<p>
			Oxc は、JavaScript と TypeScript を解析・変換するツール群です。Oxlint は Svelte や Vue
			のファイルでもスクリプト部分を検査できます。ただし、<a href="https://oxc.rs/compatibility"
				>公式の対応表</a
			>ではテンプレートの検査は未対応です（<a href="https://oxc.rs/docs/guide/usage/linter"
				>Oxlint の対象範囲</a
			>）。Oxfmt で Svelte を整形するには、別に <code>svelte/compiler</code> が必要です。
		</p>
		<p>
			ESLint 向けの eslint-plugin-svelte は、パーサーに <a
				href="https://github.com/sveltejs/svelte-eslint-parser#usage-for-custom-rules--plugins"
				>svelte-eslint-parser</a
			> を使います。このパーサーは、テンプレートを含む Svelte の AST とスコープ解析を、独自ルールに渡します。rsvelte
			は同じ種類の解析を Rust で持ち、コンパイルや整形と同じ結果を使います。
		</p>
		<p>
			rsvelte は
			JavaScript、テンプレート、スタイルの構文木を持ちます。名前解決では、テンプレート内の識別子を、スクリプトの宣言やテンプレート内のローカル変数に結び付けます。スコープと参照先は構文木とは別の表に保存し、コード検査とコンパイルで使います。一般的な
			JavaScript のコード検査ルールは、多くはそろえない方針です。
		</p>
		<p class="reading">設計の詳細：<a href="/learn/kernel/layers">構文木と解析結果の持ち方</a></p>
	</section>

	<section id="extensions">
		<p class="eyebrow">02 · 拡張性</p>
		<h2>独自のコード検査ルールに、<br />テンプレートと名前解決を渡す</h2>
		<p>
			たとえば「フォームの送信には、指定したモジュールから import した SubmitButton
			だけを使う」というルールを考えます。タグ名を比べるだけでは、同じ名前の別のコンポーネントと区別できません。テンプレートの要素と、その名前が指す
			import 宣言の両方が必要です。
		</p>
		<p>
			ESLint では、01 で見た svelte-eslint-parser の AST
			とスコープ解析を使って、このルールを書けます。Oxlint も JavaScript
			で書いたプラグインに対応します。ただし、<a
				href="https://oxc.rs/docs/guide/usage/linter/js-plugins#api-support">プラグインの対応範囲</a
			>には、Svelte や Vue などの独自形式とパーサーは未対応と書かれています。
		</p>
		<div class="extension-flow" aria-label="独自ルールの入力と出力">
			<div><span>既存の言語プラグイン</span><strong>テンプレートの構文木と名前解決</strong></div>
			<b aria-hidden="true">→</b>
			<div><span>追加する処理</span><strong>独自のコード検査ルール</strong></div>
			<b aria-hidden="true">→</b>
			<div><span>利用者に返す結果</span><strong>ソース内の範囲を持つ診断</strong></div>
		</div>
		<p>
			rsvelte では、Rust
			で書いたタスクを登録し、既存の構文解析と名前解決の結果を取り出せます。独自の検査はそのデータを見て条件を判定し、診断を返します。ESLint
			との違いは、ルールがコンパイルや整形と同じプロセスで、同じ構文解析と名前解決の結果を使うことです。結果は文書（処理する
			1
			つのファイルの内容）ごとのキャッシュから取り出すため、ルール側でパーサーや名前解決を実装する必要はありません。
		</p>
		<p>
			構文木のノードは、元のソース内の範囲を持ちます。診断はその範囲を使い、共通の出力処理で行と列に変換されます。ソースの管理、キャッシュ、診断、スケジューラは、言語を知らない共通部分（カーネル）にあり、新しい言語プラグインもそれを再利用します。
		</p>
		<div class="premise">
			<span>今できる拡張</span>
			<p>
				今の拡張は、Rust で書いたタスクや解析処理を、カーネルを呼び出すプログラム（rsvelte
				のコマンドなど）に静的にリンクする方式です。設定ファイルで指定できるのは組み込みのプラグインのオプションで、任意のプラグインを読み込む仕組みはまだありません。ESLint
				のルールをそのまま動かす互換機能もありません。
			</p>
		</div>
		<p class="reading">動く実装例：<a href="/learn/plugins">プラグインを実装する</a></p>
	</section>

	<section id="sharing">
		<p class="eyebrow">03 · 構文解析の重複</p>
		<h2>4 種類の処理に、<br />同じ Svelte の構文木を渡す</h2>
		<p>
			コード検査、整形、コンパイルを別々のプロセスで実行すると、ツールごとにソースから構文木を作ります。ESLint
			が Svelte を解析した結果は、通常、Prettier や Svelte のコンパイラには渡りません。
		</p>
		<p>
			一回のコード検査の中で構文木を共有する仕組みや、変更のないファイルを飛ばすキャッシュは、既存のツールにもあります。rsvelte
			が共通にするのは、種類の違うタスクが同じ文書から作る構文木と解析結果です。
		</p>
		<p>
			下の図は、同じ Svelte ファイルに整形、コード検査、コンパイル、型検査の 4
			つを選んだ状態です。文書内の処理を順に実行し、型検査は全ファイルの検査用 TypeScript
			がそろってから行います。工程の枠を選ぶと、その時点の入力と生成したデータを確認できます。
		</p>
		<p>
			図と表では、ソースの構造をそのまま持つ構文木を
			AST（抽象構文木）、コンパイラ向けに整理した構文木を
			HIR（高水準の中間表現）と呼びます。スコープや参照先は、ノードの識別番号で引く別の表に保存します。
		</p>
		<DataStructures />
		<ParseSharingFigure markup={data.pipeline} />
		<p>図の「スコープ構築・参照解析」は、識別子と宣言を結び付けるほかに、次の表を作ります。</p>
		<ul>
			<li>
				スコープ表：関数、ブロック、テンプレートの <code>&#123;#each&#125;</code> などが作るスコープと、その親子関係。
			</li>
			<li>
				宣言表：変数や import の宣言と、それが属するスコープ。Svelte では <code>$state</code> や props
				などの宣言の種類も記録します。
			</li>
			<li>
				参照表：識別子の参照先と、読み取りか書き込みか。<code>bind:value</code> のようなテンプレート側の書き込みも含みます。
			</li>
		</ul>
		<p>
			今の rsvelte
			のスコープと参照の解析は、制御フローグラフを作りません。到達できるかや、経路ごとの代入の状態を調べるには、分岐やループを通る実行経路の解析（制御フロー解析）が別に要ります。
		</p>
		<p class="reading">
			実装：<a href="{REPO_URL}/blob/experimental/crates/languages/typescript/semantic/src/scope.rs"
				>2 パスのスコープと参照の解析</a
			>、<a
				href="{REPO_URL}/blob/experimental/crates/languages/svelte/semantic/src/semantic/resolve.rs"
				>Svelte のテンプレートと runes の解析</a
			>
		</p>
		<p>
			タスクは、文書ごとの実行コンテキスト <code>DocumentContext</code> に、欲しい結果の Rust の型を指定して計算結果を求めます。最初の要求で計算し、同じ結果への後の要求にはキャッシュを返します。整形だけを選んだ場合は、コード生成用の計算結果を求めません。計算どうしの依存は、各計算が途中で求める結果から決まります。
		</p>
		<p>
			共有する構文木は変更しません。コンパイルの変換は別の構文木を作り、コード検査や整形が読む元の構文木には触れません。途中のコードを文字列に出力し、もう一度構文解析して変換を続けることもしません。
		</p>
		<p>
			キャッシュが有効なのは、一つの文書を処理する <code>DocumentContext</code> の中だけです。別々に起動したコマンドの間で共有する永続キャッシュや、編集前の結果を再利用する仕組みはまだありません。型検査用に生成した
			TypeScript は外部の型検査器がもう一度構文解析するため、ツール全体で構文解析が一回になるわけではありません。
		</p>
		<p>
			共有の効果は、同じ入力とタスクで「共有する場合」と「処理ごとに計算し直す場合」を比べて測ります（<a
				href="/learn/measure#arms">測定条件と結果</a
			>）。この比較だけでは、アプリ全体のビルドが公式ツールより速いとは言えません。
		</p>
	</section>

	<section id="project">
		<p class="eyebrow">04 · 将来の設計</p>
		<h2>すべての呼び出し元の props を解析し、<br />コンパイル前に最適化する</h2>
		<p>
			子コンポーネントが <code>$props()</code> で受け取る <code>tone</code> に、すべての呼び出し元が
			<code>"quiet"</code> を渡す場合を考えます。子のソースだけでは、その値がすべての呼び出しで同じ定数かを証明できません。呼び出し元のテンプレートと
			import の解決結果を集めれば、定数への置き換えを検討できます。
		</p>
		<p>
			公式の <a href="https://svelte.dev/docs/svelte/svelte-compiler#compile"
				>Svelte のコンパイル関数</a
			>は、一つのコンポーネントのソースと設定を受け取ります。全モジュールの import
			関係や、各呼び出し箇所の props
			は入力に入りません。そのため、コンポーネントごとにコンパイルする通常の方法では、すべての呼び出し元を前提にした最適化はできません。
		</p>
		<ProjectFactsFigure />
		<p>
			設計では、まず各ファイルの構文木と名前解決から、import、コンポーネントの呼び出し箇所、渡す
			props
			の要約を作ります。次に要約をプロジェクト全体で結合し、各コンポーネントの呼び出しをすべて把握できるかを判定します。定数が一致し、変換の安全条件も満たすときだけ、新しいコンパイル用の構文木を作ります。
		</p>
		<ol class="project-flow">
			<li>
				<span>各ファイル</span><strong>呼び出し箇所を要約する</strong>
				<p>import 先と渡す props を記録する。</p>
			</li>
			<li>
				<span>プロジェクト全体</span><strong>要約を結合して判定する</strong>
				<p>すべての呼び出しと定数の値を証明する。</p>
			</li>
			<li>
				<span>コンパイルの前</span><strong>Svelte の構文木を変換する</strong>
				<p>元の木は残し、意味解析を更新する。</p>
			</li>
			<li>
				<span>コンパイルの後</span><strong>JavaScript をバンドルする</strong>
				<p>生成後の最適化は、バンドラーの Rolldown や Oxc に任せる。</p>
			</li>
		</ol>
		<p>
			Rolldown や Oxc は、生成後の JavaScript を最適化できます。ただ、Svelte の props
			の受け取り方やリアクティビティは、生成後にはランタイム関数の呼び出しになっています。Svelte
			の構文木を変換する段階なら、props の宣言と参照を解析結果から直接取り出せます。
		</p>
		<p>
			ただし、置き換える前に、props への代入、<code>$bindable</code
			>、デフォルト値を評価する順序と副作用を確かめる必要があります。属性のスプレッド、動的なコンポーネントの参照、外部への
			export
			があると、値や呼び出し元を決められないことがあります。分からない情報は、最適化の根拠にしません。今の設計では、定数にした結果として不要になる
			<code>&#123;#if&#125;</code> の分岐を消すことも対象外です。
		</p>
		<div class="premise">
			<span>今後の計画</span>
			<p>
				速度や出力サイズの改善は、まだ測っていません。利用者が明示的に有効にする方式を計画しています。実装するときは、描画結果、リアクティブな更新、イベントの実行順、サーバーレンダリングとハイドレーションが変わらないことを検証します。
			</p>
		</div>
	</section>

	<section id="today">
		<p class="eyebrow">05 · 実装状況</p>
		<h2>実装済みの機能と、<br />未実装の設計</h2>
		<p>
			Svelte
			向けのツールをすでに使っているなら、置き換えを考える最初の条件は、対応している構文と出力の正しさです。rsvelte
			は実験段階で、実際のソースには未対応の構文があります。
		</p>
		<div class="status-grid">
			<div>
				<span class="status-label">実装済み</span>
				<h3>文書内での解析結果の共有</h3>
				<p>
					言語プラグインが保存した結果を、コード検査・整形・コンパイルのタスクから取り出せます。
				</p>
				<a href="/learn/playground">プレイグラウンドで処理の流れを試す →</a>
			</div>
			<div>
				<span class="status-label">実装済み（Rust で静的にリンク）</span>
				<h3>独自のタスクの登録</h3>
				<p>
					既存の構文解析結果を使う実装例があります。配布できる動的なプラグインはまだありません。
				</p>
				<a href="/learn/plugins">実装例を読む →</a>
			</div>
			<div>
				<span class="status-label planned">未実装</span>
				<h3>ファイルをまたぐ最適化と永続キャッシュ</h3>
				<p>設計を検討している段階で、効果はまだ測っていません。</p>
			</div>
		</div>
		<p>
			一般的な JavaScript のコード検査には Oxlint の既存ルールがあり、Svelte
			向けには公式のコンパイラや検査ツールがあります。rsvelte
			が主に検証しているのは、テンプレートの解析結果を使う独自のタスクと、コード検査・整形・コンパイルの間でのキャッシュの共有です。
		</p>
		<p class="reading">
			今の数字：<a href="/#ledger">公式ツールとの一致</a>、<a href="/learn/measure">性能の測定</a>
		</p>
	</section>

	<aside class="references" aria-labelledby="references-title">
		<h2 id="references-title">根拠と参考資料</h2>
		<p>
			外部ツールの対応範囲は、公式の資料で確認しました。確認した日は svelte-eslint-parser が 2026 年
			11 月 8 日、ほかは 2026 年 10 月 2
			日です。今後変わることがあるため、導入するときはリンク先も確認してください。
		</p>
		<ul>
			<li>
				<a href="https://oxc.rs/compatibility">Oxlint と Oxfmt の対応表</a>、<a
					href="https://oxc.rs/docs/guide/usage/linter/js-plugins">Oxlint の独自プラグイン</a
				>
			</li>
			<li>
				<a href="https://eslint.org/docs/latest/extend/custom-rules">ESLint の独自ルール</a>、<a
					href="https://github.com/sveltejs/svelte-eslint-parser#usage-for-custom-rules--plugins"
					>svelte-eslint-parser の独自ルール向けの説明</a
				>、<a href="https://svelte.dev/docs/svelte/svelte-compiler">Svelte のコンパイル関数</a>
			</li>
			<li>
				<a href="/learn/kernel">rsvelte の構成（第 1 章「カーネルの全体像」）</a>、<a
					href="/learn/measure">測定方法（第 14 章「実測」）</a
				>
			</li>
		</ul>
	</aside>
</main>

<style>
	.why {
		max-width: 1080px;
		margin: 0 auto;
		padding: 64px 24px 0;
	}
	.intro {
		max-width: 780px;
	}
	h1 {
		margin: 20px 0 32px;
		font-size: clamp(42px, 7vw, 76px);
		line-height: 1.18;
		font-weight: 600;
		letter-spacing: 0.01em;
	}
	.lead {
		font-size: clamp(18px, 2vw, 22px);
		color: var(--fg);
	}
	p {
		font-size: 16px;
		line-height: 2;
		color: var(--fg-2);
		margin: 20px 0;
		overflow-wrap: anywhere;
	}
	a {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	a:hover {
		text-decoration-thickness: 2px;
	}
	.contents {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 24px;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		padding: 22px 0;
		margin: 48px 0 64px;
	}
	.contents a {
		font-size: 14px;
		color: var(--fg-2);
		text-decoration: none;
	}
	.contents span {
		margin-right: 8px;
		font-family: var(--font-mono);
		color: var(--accent);
	}
	section {
		scroll-margin-top: 90px;
		margin-top: 88px;
	}
	h2 {
		font-size: clamp(26px, 4vw, 38px);
		line-height: 1.5;
		font-weight: 600;
		margin: 12px 0 28px;
	}
	section > p {
		max-width: 760px;
	}
	.premise {
		border-left: 3px solid var(--border-strong);
		padding: 16px 22px;
		background: var(--sunken);
		margin-top: 28px;
		max-width: 780px;
	}
	.premise > span {
		font-size: 13px;
		font-weight: 600;
	}
	.premise p {
		font-size: 14px;
		margin: 8px 0 0;
	}
	.reading {
		font-size: 14px;
	}
	.extension-flow {
		display: flex;
		align-items: center;
		gap: 14px;
		margin: 32px 0;
	}
	.extension-flow > div {
		flex: 1;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 22px 16px;
		background: var(--sunken);
	}
	.extension-flow span,
	.project-flow span {
		display: block;
		color: var(--muted);
		font-size: 12px;
		margin-bottom: 8px;
	}
	.extension-flow strong {
		font-size: 14px;
	}
	.extension-flow b {
		color: var(--accent);
	}
	.project-flow {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		list-style: none;
		padding: 0;
		margin: 32px 0;
		counter-reset: phase;
	}
	.project-flow li {
		padding: 20px 16px;
		border-top: 2px solid var(--accent);
		background: var(--sunken);
		counter-increment: phase;
	}
	.project-flow li::before {
		content: '0' counter(phase);
		display: block;
		color: var(--accent);
		font-family: var(--font-mono);
		margin-bottom: 16px;
	}
	.project-flow strong {
		font-size: 14px;
	}
	.project-flow p {
		font-size: 13px;
		line-height: 1.8;
		margin-bottom: 0;
	}
	.status-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin: 32px 0;
	}
	.status-grid > div {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 24px;
	}
	.status-label {
		font-size: 12px;
		color: var(--accent);
	}
	.status-label.planned {
		color: var(--muted);
	}
	h3 {
		font-size: 18px;
		line-height: 1.6;
		font-weight: 600;
		margin-top: 12px;
	}
	.status-grid p,
	.status-grid a {
		font-size: 14px;
	}
	.references {
		margin-top: 72px;
		padding-top: 28px;
		border-top: 1px solid var(--border);
	}
	.references h2 {
		font-size: 20px;
	}
	.references p,
	.references li {
		font-size: 13px;
		line-height: 2;
	}
	.references ul {
		list-style: disc;
		padding-left: 20px;
	}
	@media (max-width: 760px) {
		.why {
			padding: 40px 20px 0;
		}
		.status-grid {
			grid-template-columns: 1fr;
		}
		.extension-flow {
			flex-direction: column;
			align-items: stretch;
		}
		.extension-flow b {
			text-align: center;
			transform: rotate(90deg);
		}
		.project-flow {
			grid-template-columns: 1fr 1fr;
		}
		section {
			margin-top: 64px;
		}
	}
</style>
