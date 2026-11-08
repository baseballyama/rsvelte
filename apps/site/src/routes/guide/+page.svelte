<script lang="ts">
	import GuideCode from '#lib/components/GuideCode.svelte';
	import { guideExamples, guideSections } from '#lib/guide.ts';
	import { REPO_URL } from '#lib/site.ts';
</script>

<svelte:head>
	<title>使い方ガイド — rsvelte</title>
	<meta
		name="description"
		content="rsvelte をブラウザで試す方法と、手元の Svelte ファイルをコンパイル・整形・検査する手順、Web アプリへの組み込み方。"
	/>
</svelte:head>

<main
	class="mx-auto max-w-[1200px] px-4 py-10 md:px-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:py-14"
>
	<aside class="hidden lg:block">
		<nav
			class="rounded-lg border border-line bg-sunken p-4 lg:sticky lg:top-24"
			aria-label="ガイドの目次"
		>
			<p class="mb-3 text-[14px] font-medium">使い方ガイド</p>
			<ol class="space-y-1">
				{#each guideSections as section}
					<li>
						<a
							class="block rounded px-2 py-1.5 text-[14px] text-fg-2 hover:bg-surface hover:text-fg"
							href="#{section.id}">{section.title}</a
						>
					</li>
				{/each}
			</ol>
			<a
				class="mt-5 block border-t border-line pt-4 text-[13px] text-accent hover:underline"
				href="/learn">内部の実装を学ぶ</a
			>
		</nav>
	</aside>
	<nav class="mb-8 lg:hidden" aria-label="ガイドの目次">
		<details class="rounded-lg border border-line bg-sunken px-4 py-3">
			<summary class="cursor-pointer text-[14px] font-medium">このページの目次</summary>
			<ol class="mt-3 space-y-1">
				{#each guideSections as section}
					<li>
						<a
							class="block rounded px-2 py-1.5 text-[14px] text-fg-2 hover:bg-surface hover:text-fg"
							href="#{section.id}">{section.title}</a
						>
					</li>
				{/each}
			</ol>
		</details>
	</nav>

	<article class="min-w-0 max-w-[760px]">
		<header class="mb-10">
			<p class="eyebrow">rsvelte を使う</p>
			<h1 class="mt-3 text-[34px] leading-tight font-semibold sm:text-[42px]">使い方ガイド</h1>
			<p class="mt-5 text-[17px] leading-[1.9] text-fg-2">
				Svelte のファイルを rsvelte でコンパイル・整形・検査する手順です。Rust
				のコードを読む必要はありません。手元で使うときは、ソースから実行ファイルをビルドします。
			</p>
			<p class="mt-4 text-[14px] leading-[1.8] text-muted">
				対象は experimental ブランチの実装です。未対応の構文があり、公式ツール（公式の Svelte
				コンパイラなど）と結果が違うこともあります。
			</p>
		</header>

		<div class="prose-learn">
			<section id="try">
				<h2>{guideSections[0].title}</h2>
				<p>
					<a href="/learn/playground">プレイグラウンド</a
					>なら、インストールせずにコンパイル・整形・検査を試せます。「入力」で Svelte
					を選び、ソースを編集して「行う処理」を選び、「実行」を押します。
				</p>
				<p>
					結果には、生成したファイルと診断が出ます。診断は、ソースの問題や未対応の構文を知らせるメッセージです。ブラウザでは型チェックを実行できません。
				</p>
			</section>

			<section id="setup">
				<h2>{guideSections[1].title}</h2>
				<p>
					このページのコマンドは、macOS と Linux の bash や zsh 向けです。Windows
					では確かめていません。
				</p>
				<p>
					Git と Rust を用意してください。Rust の版は、リポジトリの <code>rust-toolchain.toml</code>
					が決めます。ターミナルで次のコマンドを実行します。
				</p>
				<GuideCode code={guideExamples.setup} label="ソースの取得とビルド" />
				<p>
					以降のコマンドは、取得した <code>rsvelte</code>
					ディレクトリで実行します。次のソースを <code>Counter.svelte</code>
					として保存してください。クリックすると数が増える Svelte 5 のコンポーネントです。
				</p>
				<GuideCode code={guideExamples.source} label="Counter.svelte" />
			</section>

			<section id="compile">
				<h2>{guideSections[2].title}</h2>
				<p>ブラウザで動く JavaScript を生成します。</p>
				<GuideCode code={guideExamples.compile} label="ブラウザ向けのコンパイル" />
				<p>
					処理は <code>--task</code>
					で選びます。結果は標準出力に出て、入力ファイルは変わりません。出力は
					<code>// svelte.compile/client js</code> という見出しの行で始まり、その後に JavaScript
					が続きます。ソースにスタイルがあれば、<code>// svelte.compile/client css</code>
					の後にスタイルも出ます。診断は <code>// svelte.compile/client diagnostics</code>
					の後に JSON で出ます。
				</p>
				<p>
					見出しの行を含むので、出力をそのまま JavaScript
					ファイルとして保存しても動きません。生成したコードを動かすには、Svelte
					のランタイムとアプリのビルド設定も必要です。
				</p>
				<p>サーバーでページの HTML を生成するときは、次の処理を選びます。</p>
				<GuideCode code={guideExamples.server} label="サーバー向けのコンパイル" />
			</section>

			<section id="format">
				<h2>{guideSections[3].title}</h2>
				<p>整形したソースを表示します。</p>
				<GuideCode code={guideExamples.format} label="ソースの整形" />
				<p>
					<code>// svelte.format/default svelte</code>
					の後に整形結果が出ます。ファイルを上書きするオプションはありません。結果を確かめてから、見出しの行を除いて入力ファイルに写してください。出力を同じファイルへリダイレクトすると、読む前に中身が消えます。
				</p>
			</section>

			<section id="lint">
				<h2>{guideSections[4].title}</h2>
				<p>ソースの問題を探します。</p>
				<GuideCode code={guideExamples.lint} label="ソースの検査" />
				<p>
					結果は <code>// svelte.lint/default lint.json</code> の後に JSON で出ます。<code
						>rules</code
					>
					は使ったルール、<code>findings</code> は見つかった問題の一覧です。<code>findings</code>
					が空なら、問題は見つかっていません。
				</p>
				<p>
					たとえば例のボタンから <code>type="button"</code> を消すと、<code
						>svelte/button-has-type</code
					>
					の指摘が出ます。ボタンの種類を指定していない、という指摘です。各指摘の
					<code>rule</code>、<code>message</code>、<code>start</code>、<code>end</code>
					を見てソースを直します。位置の行と列は 1 から数えます。
				</p>
				<p>整形と検査を一度に実行するときは、<code>--task</code> を繰り返します。</p>
				<GuideCode code={guideExamples.combined} label="整形と検査をまとめて実行" />
				<p>検査は、整形する前の元のソースを読みます。</p>
			</section>

			<section id="check">
				<h2>{guideSections[5].title}</h2>
				<p>型チェックには次の三つが必要です。</p>
				<ul>
					<li>
						TypeScript 7.1 以上のネイティブ版の実行ファイル。Node.js で動く従来の TypeScript
						コマンドとは別のもので、npm のパッケージに入っています。
					</li>
					<li>型定義を読むための Svelte パッケージ。</li>
					<li>
						<code>rsvelte-typescript-content-mapper</code>。TypeScript が Svelte
						ファイルを読むときに呼ぶ、rsvelte の実行ファイルです。Svelte から作った TypeScript
						と、両者の位置の対応を返します。
					</li>
				</ul>
				<p>
					Node.js と npm も用意してください。<code>rsvelte</code>
					のディレクトリで、次のコマンドを順に実行します。
				</p>
				<GuideCode code={guideExamples.checkSetup} label="型チェックに必要なものを用意する" />
				<ol>
					<li>
						1 行目は、位置対応の実行ファイルを <code>~/.cargo/bin</code>
						に入れます。このディレクトリが <code>PATH</code> に入っていることを確かめてください。
					</li>
					<li>
						2 行目は、リポジトリの検証と同じ版の TypeScript と Svelte を
						<code>typecheck-tools/node_modules</code> に取得します。
					</li>
					<li>
						3 行目は、お使いの環境に合うネイティブ版の実行ファイルの絶対パスを、変数
						<code>TSC</code> に入れます。4 行目がそのパスを表示します。
					</li>
				</ol>
				<p>
					<code>Counter.svelte</code>
					を次の内容に置き換えます。数値の変数に文字列を入れているので、型の不一致が見つかるはずです。
				</p>
				<GuideCode code={guideExamples.typedSource} label="型の不一致を含む Counter.svelte" />
				<p>
					同じターミナルで次のコマンドを実行します。<code>$TSC</code>
					は、さきほど入れたパスに置き換わります。
				</p>
				<GuideCode code={guideExamples.check} label="型チェックの実行" />
				<p>
					型の指摘は <code>// svelte.check/default json</code>
					の後に出ます。この例では、数値の型に文字列を代入できないという <code>2322</code>
					の指摘が出ます。<code>"zero"</code> を <code>0</code>
					に変えると、この指摘は消えます。
				</p>
				<p>
					位置の数え方はコード検査と違い、行と文字を 0 から数えます。公式の型チェックツール
					svelte-check
					と同じ形式だからです。設定が足りないときや、変換できない構文があるときは、別の診断として出ます。
				</p>
				<p>
					型チェックの対象は <code>lang="ts"</code>
					のスクリプトだけです。JavaScript のスクリプトは型チェックしません。
				</p>
				<h3>オプション</h3>
				<p>
					rsvelte
					の処理は、プラグイン（言語や処理ごとに分かれた機能のまとまり）が提供します。型チェックの処理は、<code
						>typescript.check</code
					>
					と <code>svelte.check</code> の二つのプラグインの設定を読みます。<code>--options</code>
					は、プラグイン名と、そのオプションの JSON を受け取ります。
				</p>
				<div class="overflow-x-auto">
					<table class="table">
						<caption class="mb-2 text-left text-[14px] text-fg-2">型チェックのオプション</caption>
						<thead><tr><th>オプション</th><th>指定する値</th></tr></thead>
						<tbody>
							<tr
								><td><code>typescript.check</code> の <code>command</code></td><td
									>型チェッカーとその引数</td
								></tr
							>
							<tr
								><td><code>typescript.check</code> の <code>tsconfig</code></td><td
									>引き継ぐプロジェクトの設定ファイル。省略できます</td
								></tr
							>
							<tr
								><td><code>svelte.check</code> の <code>svelte</code></td><td
									>Svelte パッケージのディレクトリ</td
								></tr
							>
							<tr
								><td><code>svelte.check</code> の <code>contentMapper</code></td><td
									>位置対応の実行ファイル。省略できます</td
								></tr
							>
						</tbody>
					</table>
				</div>
				<p>
					相対パスは、コマンドを実行したディレクトリから解決します。<code>tsconfig</code>
					を省くと、そのディレクトリに <code>tsconfig.json</code>
					があれば使います。この例は <code>rsvelte</code> のディレクトリで実行し、そこに
					<code>tsconfig.json</code>
					はないので、省いています。既存のプロジェクトを検査するときは、<code>tsconfig</code>
					と <code>svelte</code> にそのプロジェクトのものを指定します。
				</p>
				<p>
					型チェッカーには、TypeScript 7.1 の <code>tsc</code>
					のほか、同じコマンドラインを持つ型チェッカー（<code>tsrs</code>
					など）も使えます。名前だけを書くと、現在のディレクトリとその親の
					<code>node_modules/.bin</code>
					を探し、なければ <code>PATH</code> から探します。<code>contentMapper</code>
					を省くと、同じ方法で <code>rsvelte-typescript-content-mapper</code> を探します。
				</p>
				<p>
					型チェッカーが見つからない、版が古い、といった問題は、ファイルを読む前に報告します。同じ設定は、<code
						>--config</code
					>
					で渡す設定ファイルの <code>plugins</code> にも書けます。
				</p>
			</section>

			<section id="browser">
				<h2>{guideSections[6].title}</h2>
				<p>
					ブラウザ内でソースを処理するときは、WebAssembly
					版を使います。リポジトリのルートで次のコマンドを実行してください。
				</p>
				<GuideCode
					code={guideExamples.wasmBuild}
					label="WebAssembly と JavaScript の接続ファイルを生成"
				/>
				<p>
					ルートの <code>browser-package/</code> に、JavaScript、型定義、WebAssembly
					のファイルができます。次のコードを、ルートに <code>main.js</code> として保存します。
				</p>
				<GuideCode code={guideExamples.wasmUse} label="main.js" />
				<p>同じ場所に、<code>main.js</code> を読み込む <code>index.html</code> を作ります。</p>
				<GuideCode code={guideExamples.wasmPage} label="index.html" />
				<p>
					ファイルから直接開くと、ブラウザは WebAssembly
					を読み込めません。ルートで次のコマンドを実行し、Web サーバーを起動します（Python 3
					が要ります）。
				</p>
				<GuideCode code={guideExamples.wasmServe} label="ルートを配信する Web サーバー" />
				<p>
					ブラウザで <code>http://localhost:8000/</code>
					を開き、開発者ツールのコンソールを見ると、生成したファイルと診断が出ています。<code
						>import</code
					>
					の相対パスは <code>main.js</code> の場所が基準なので、<code>browser-package/</code>
					は <code>main.js</code> と同じディレクトリに置きます。
				</p>
				<p>
					<code>init()</code> は WebAssembly の読み込みを待ちます。<code>runPipeline()</code>
					は結果を JSON の文字列で返すので、<code>JSON.parse()</code> で値に変換します。
				</p>
				<div class="overflow-x-auto">
					<table class="table">
						<caption class="mb-2 text-left text-[14px] text-fg-2">runPipeline の引数</caption>
						<thead><tr><th>順番</th><th>渡す値</th></tr></thead>
						<tbody>
							<tr><td>1</td><td>処理するソースの文字列</td></tr>
							<tr><td>2</td><td>拡張子を含むファイル名。例は <code>App.svelte</code></td></tr>
							<tr
								><td>3</td><td
									>使う言語プラグインをカンマで区切った文字列。例は <code>svelte</code></td
								></tr
							>
							<tr><td>4</td><td>実行する処理をカンマで区切った文字列</td></tr>
							<tr
								><td>5</td><td
									><code>true</code> なら、処理どうしで解析結果を共有します。<code>false</code>
									なら、処理ごとに構文解析からやり直します</td
								></tr
							>
						</tbody>
					</table>
				</div>
				<p>言語プラグインは次の四つから選びます。</p>
				<ul>
					<li><code>svelte</code>：Svelte ファイルを処理します。</li>
					<li><code>vue</code>：Vue ファイルを処理します。</li>
					<li><code>svue</code>：Vue ファイルを Svelte のコンパイラでコンパイルします。</li>
					<li><code>vuelte</code>：Svelte ファイルを Vue Vapor 向けにコンパイルします。</li>
				</ul>
				<p>
					処理は <code>compile-client</code>、<code>compile-server</code>、<code>format</code
					>、<code>lint</code> から選びます。コマンドラインの処理名とは違います。
				</p>
				<p>
					返り値の <code>ok</code> が <code>false</code> なら、引数か実行に問題があります。理由は
					<code>message</code> に入ります。<code>true</code> でも、ソースの問題は <code>steps</code>
					の各処理の <code>diagnostics</code> に入ります。生成したファイルは <code>files</code>
					に入ります。
				</p>
				<p>
					解析結果の共有は、その呼び出しの中だけです。ブラウザ版は 1 回に 1 ファイルを処理し、入力は
					UTF-8 で 65,536 バイトまでです。型チェックはできません。
				</p>
			</section>

			<section id="limits">
				<h2>{guideSections[7].title}</h2>
				<p>
					このガイドの例は Svelte 5 のルーンを使います。Svelte 4 の旧構文、アプリ全体のビルド、Vite
					との接続は扱いません。
				</p>
				<p>
					<code>run</code>
					は 1 ファイルずつ処理します。既存のプロジェクトで使う前に、処理したいファイルで結果を確かめてください。
				</p>
				<p>
					<code>run</code>
					は、診断や指摘が出ても終了コード 0 で終わります。自動検査に組み込むときは、出力の診断と指摘を調べてください。
				</p>
				<ul>
					<li>
						処理名が不明というメッセージが出たら、<code>--task</code>
						の値をこのガイドの例と比べます。
					</li>
					<li>何も出力されないときは、ファイルの拡張子と処理の言語が合っているかを確かめます。</li>
					<li>型チェックの設定エラーでは、実行ファイルとパッケージのパスを確かめます。</li>
					<li>
						ブラウザ版を読み込めないときは、開発者ツールで JavaScript と WebAssembly
						のファイルが配信されているかを確かめます。
					</li>
				</ul>
				<p>
					問題は <a href="{REPO_URL}/issues">GitHub の課題一覧</a
					>に報告してください。再現するソース、実行したコマンド、出力、使ったコミットを添えます。コミットは
					<code>git rev-parse HEAD</code> で分かります。
				</p>
				<p>
					内部の仕組みや処理の追加方法は、<a href="/learn">開発者向けの教材</a>にあります。
				</p>
			</section>
		</div>
	</article>
</main>

<style>
	section {
		scroll-margin-top: 6rem;
	}
	section + section {
		margin-top: 3.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}
	section > :global(* + *) {
		margin-top: 1.25rem;
	}
	section > h2 {
		margin-top: 0;
	}
</style>
