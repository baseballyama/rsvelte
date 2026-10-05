<script lang="ts">
	import GuideCode from '$lib/components/GuideCode.svelte';
	import { guideExamples, guideSectionsIn } from '$lib/guide';
	import { REPO_URL } from '$lib/site';
</script>

<svelte:head>
	<title>使い方ガイド — rsvelte</title>
	<meta name="description" content="rsvelte をブラウザで試し、手元の Svelte ファイルをコンパイル・整形・検査する手順と、Web アプリへの組み込み方を紹介します。" />
</svelte:head>

<main class="mx-auto max-w-[1200px] px-4 py-10 md:px-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:py-14">
	<aside class="hidden lg:block">
		<nav class="rounded-lg border border-line bg-sunken p-4 lg:sticky lg:top-24" aria-label="ガイドの目次">
			<p class="mb-3 text-[14px] font-medium">使い方ガイド</p>
			<ol class="space-y-1">
				{#each guideSectionsIn('ja') as section}
					<li><a class="block rounded px-2 py-1.5 text-[14px] text-fg-2 hover:bg-surface hover:text-fg" href="#{section.id}">{section.title}</a></li>
				{/each}
			</ol>
			<a class="mt-5 block border-t border-line pt-4 text-[13px] text-accent hover:underline" href="/learn">内部の実装を学ぶ</a>
		</nav>
	</aside>
	<nav class="mb-8 lg:hidden" aria-label="ガイドの目次">
		<details class="rounded-lg border border-line bg-sunken px-4 py-3">
			<summary class="cursor-pointer text-[14px] font-medium">このページの目次</summary>
			<ol class="mt-3 space-y-1">
				{#each guideSectionsIn('ja') as section}
					<li><a class="block rounded px-2 py-1.5 text-[14px] text-fg-2 hover:bg-surface hover:text-fg" href="#{section.id}">{section.title}</a></li>
				{/each}
			</ol>
		</details>
	</nav>

	<article class="min-w-0 max-w-[760px]">
		<header class="mb-10">
			<p class="eyebrow">rsvelte を使う</p>
			<h1 class="mt-3 text-[34px] leading-tight font-semibold sm:text-[42px]">使い方ガイド</h1>
			<p class="mt-5 text-[17px] leading-[1.9] text-fg-2">Svelte のソースを、コンパイル・整形・検査するための手順です。Rust のコードを読む必要はありません。手元で使う場合は、ソースから実行ファイルをビルドします。</p>
			<p class="mt-4 text-[14px] leading-[1.8] text-muted">このガイドは experimental ブランチの実装を対象にしています。対応していない構文や、公式ツールと結果が異なる場合があります。</p>
		</header>

		<div class="prose-learn">
			<section id="try">
				<h2>{guideSectionsIn('ja')[0].title}</h2>
				<p><a href="/learn/playground">プレイグラウンド</a>では、インストールせずにコンパイル・整形・検査を試せます。Svelte を選び、ソースを入力して、実行したい処理を選んでください。</p>
				<p>生成されたファイルと診断が表示されます。診断は、ソース内の問題や対応していない構文を知らせるメッセージです。ブラウザでは型チェックを実行できません。</p>
			</section>

			<section id="setup">
				<h2>{guideSectionsIn('ja')[1].title}</h2>
				<p>Git と Rust の開発環境を用意してください。Rust は、リポジトリ内の <code>rust-toolchain.toml</code> で指定した版を使います。次のコマンドをターミナルで実行します。</p>
				<GuideCode code={guideExamples.setup} label="ソースの取得とビルド" />
				<p>以降のコマンドは、取得した <code>rsvelte</code> ディレクトリで実行します。Windows では、実行ファイルのパスを <code>.\target\release\rsvelte.exe</code> に置き換えてください。複数行のコマンドは、行末の <code>\</code> を除いて 1 行にまとめます。</p>
				<p>次のソースを <code>Counter.svelte</code> として保存します。クリックすると数値が増える、Svelte 5 のコンポーネントです。</p>
				<GuideCode code={guideExamples.source} label="Counter.svelte" />
			</section>

			<section id="compile">
				<h2>{guideSectionsIn('ja')[2].title}</h2>
				<p>ブラウザで動かす JavaScript を生成します。</p>
				<GuideCode code={guideExamples.compile} label="ブラウザ向けのコンパイル" />
				<p>出力は <code>// svelte.compile/client js</code> というラベルから始まります。その後に JavaScript が続きます。サーバーでページのマークアップを生成する場合は、次の処理を選びます。</p>
				<GuideCode code={guideExamples.server} label="サーバー向けのコンパイル" />
				<p>処理名は <code>--task</code> で指定します。このコマンドは、生成したファイルの内容を標準出力に表示します。入力ファイルは変更しません。</p>
				<p>スタイルや位置の対応情報も、同じ標準出力にラベル付きで出る場合があります。出力全体をそのまま JavaScript ファイルとして保存する使い方には対応していません。アプリの実行には Svelte の実行時ライブラリと、アプリ側のビルド設定が必要です。</p>
			</section>

			<section id="format">
				<h2>{guideSectionsIn('ja')[3].title}</h2>
				<p>整形したソースを表示します。</p>
				<GuideCode code={guideExamples.format} label="ソースの整形" />
				<p><code>// svelte.format/default svelte</code> の後に整形結果が続きます。内容を確認し、ラベルを除いたソースを入力ファイルに反映してください。ファイルを上書きするオプションはありません。</p>
			</section>

			<section id="lint">
				<h2>{guideSectionsIn('ja')[4].title}</h2>
				<p>ソースに問題がないかを調べます。</p>
				<GuideCode code={guideExamples.lint} label="ソースの検査" />
				<p>結果は <code>// svelte.lint/default lint.json</code> の後に表示されます。<code>rules</code> は使用したルール、<code>findings</code> は見つかった問題です。<code>findings</code> が空なら、この検査では問題が見つかっていません。</p>
				<p>たとえば、例のボタンから <code>type="button"</code> を削除すると、<code>svelte/button-has-type</code> の指摘が出ます。ボタンの種類が指定されていないという内容です。指摘の <code>rule</code>、<code>message</code>、開始位置と終了位置を確認して、ソースを修正します。</p>
				<p>整形と検査を一度に実行する場合は、<code>--task</code> を繰り返します。</p>
				<GuideCode code={guideExamples.combined} label="整形と検査をまとめて実行" />
				<p>各処理は元のソースを対象にします。整形結果を次の検査に渡す指定ではありません。</p>
			</section>

			<section id="check">
				<h2>{guideSectionsIn('ja')[5].title}</h2>
				<p>型チェックには三つのものが必要です。TypeScript 7.1 以上のネイティブ版の実行ファイルと、Svelte パッケージの型定義です。三つ目は rsvelte の位置対応の実行ファイル（<code>rsvelte-typescript-content-mapper</code>）です。TypeScript は、Node.js で動く従来の TypeScript コマンドとは別に用意してください。位置対応の実行ファイルは <code>PATH</code> から探します。別の場所に置く場合は、環境変数 <code>RSVELTE_TYPESCRIPT_CONTENT_MAPPER</code> にパスを指定します。</p>
				<p>まだ用意していない場合は、rsvelte のディレクトリで次のコマンドを実行します。最初のコマンドが位置対応の実行ファイルを入れ、次のコマンドが TypeScript と Svelte を取得します。TypeScript はリポジトリの検証でも使っている版です。最後のコマンドは、お使いの環境に合うネイティブ実行ファイルの絶対パスを表示します。</p>
				<GuideCode code={guideExamples.checkSetup} label="型チェックに必要なパッケージを取得" />
				<p>この手順では、<code>typecheck-tools/node_modules/svelte</code> が型定義のディレクトリになります。既存のプロジェクトを検査する場合は、そのプロジェクトで使っている Svelte パッケージを指定してください。</p>
				<p><code>Counter.svelte</code> を次の内容に置き換えます。数値の変数に文字列を代入しているため、型の不一致を確認できます。</p>
				<GuideCode code={guideExamples.typedSource} label="型の不一致を含む Counter.svelte" />
				<p>次のパスを、手元の実行ファイル、Svelte パッケージ、プロジェクト設定の絶対パスに置き換えて実行します。空白を含むパスは引用符で囲んでください。</p>
				<GuideCode code={guideExamples.check} label="型チェックの設定と実行" />
				<p><code>--tsc</code> は TypeScript の実行ファイル、<code>--svelte</code> は Svelte パッケージのディレクトリです。<code>--tsconfig</code> で指定した設定を引き継いで検査します。</p>
				<p>プロジェクト設定がない場合は、<code>--tsconfig</code> とそのパスを省略できます。</p>
				<p>型の指摘は <code>// svelte.check/default json</code> の後に表示されます。設定が不足した場合や、変換できない構文がある場合は、別の診断として表示されます。</p>
				<p>この例では、数値の型に文字列を代入できないという <code>2322</code> の指摘が出ます。<code>"zero"</code> を <code>0</code> に変えると、この型の指摘はなくなります。型チェックの位置は、行と文字を 0 から数えます。</p>
				<p>現在の Svelte の型チェックは、<code>lang="ts"</code> を指定したスクリプトが対象です。通常の JavaScript のスクリプトは型検査を省略します。</p>
			</section>

			<section id="browser">
				<h2>{guideSectionsIn('ja')[6].title}</h2>
				<p>ブラウザ内でソースを処理したい場合は、WebAssembly 版を使います。リポジトリのルートで、次のコマンドを実行してください。</p>
				<GuideCode code={guideExamples.wasmBuild} label="WebAssembly と JavaScript の接続ファイルを生成" />
				<p>ルートの <code>browser-package/</code> に、JavaScript、型定義、WebAssembly のファイルが生成されます。このディレクトリを Web アプリに配置し、次のように呼び出します。</p>
				<GuideCode code={guideExamples.wasmUse} label="ブラウザからコンパイルと検査を呼び出す" />
				<p>Web サーバーで配信したページから呼び出してください。<code>init()</code> は WebAssembly の読み込みを待ちます。読み込み後に <code>runPipeline()</code> を呼ぶと、結果を表す文字列が返ります。<code>JSON.parse()</code> で JavaScript の値に変換します。</p>
				<div class="overflow-x-auto">
					<table class="table">
						<caption class="mb-2 text-left text-[14px] text-fg-2">runPipeline の引数</caption>
						<thead><tr><th>順番</th><th>渡す値</th></tr></thead>
						<tbody>
							<tr><td>1</td><td>処理するソース文字列</td></tr>
							<tr><td>2</td><td>拡張子を含むファイル名。例は <code>App.svelte</code></td></tr>
							<tr><td>3</td><td>使う言語処理をカンマで区切った文字列。例は <code>svelte</code></td></tr>
							<tr><td>4</td><td>実行する処理をカンマで区切った文字列</td></tr>
							<tr><td>5</td><td>同じ呼び出し内で解析結果を共有するなら <code>true</code></td></tr>
						</tbody>
					</table>
				</div>
				<p>処理は <code>compile-client</code>、<code>compile-server</code>、<code>format</code>、<code>lint</code> から選びます。コマンドラインで指定する処理名とは異なります。</p>
				<p>返り値の <code>ok</code> が <code>false</code> なら、引数や実行に問題があります。<code>true</code> でもソースの問題が報告される場合があります。<code>steps</code> 内の各処理の <code>diagnostics</code> も確認してください。生成されたファイルは <code>files</code> に入ります。</p>
				<p>解析結果の共有は、その呼び出しが終わると終了します。次の呼び出しには引き継がれません。ブラウザ版は一度に 1 ファイルを処理します。入力の上限は、ユニコードの8ビット符号化方式で 65,536 バイトです。型チェックは提供していません。</p>
			</section>

			<section id="limits">
				<h2>{guideSectionsIn('ja')[7].title}</h2>
				<p>このガイドのコンパイル例は Svelte 5 のルーンを使います。Svelte 4 の旧構文、アプリの一括ビルド、Vite への接続は、この手順では扱いません。</p>
				<p><code>run</code> は 1 ファイルを処理します。対応していない構文は診断を確認してください。公式ツールと同じ結果になるとは限らないため、既存のプロジェクトに使う前に、処理したいファイルで結果を確認してください。</p>
				<p>コマンドの終了コードだけでは、ソースに問題がないかを判断できません。現在の <code>run</code> は、診断が出ても正常終了する場合があります。自動検査に組み込むときは、出力内の診断と型チェックの指摘を確認してください。</p>
				<ul>
					<li>処理名が不明というメッセージが出たら、このガイドの <code>--task</code> と指定を比べます。</li>
					<li>出力がない場合は、ファイルの拡張子と、選んだ処理の言語が合っているかを確認します。</li>
					<li>型チェックの設定エラーでは、実行ファイルとパッケージのパスを確認します。</li>
					<li>ブラウザ版を読み込めない場合は、開発者ツールで JavaScript と WebAssembly のファイルの配信を確認します。</li>
				</ul>
				<p>問題を報告する場合は、<a href="{REPO_URL}/issues">GitHub の課題一覧</a>に、再現できるソース、実行したコマンド、出力、使ったコミットを添えてください。コミットは <code>git rev-parse HEAD</code> で確認できます。</p>
				<p>内部の仕組みや処理の追加方法は、<a href="/learn">開発者向けの教材</a>で説明しています。</p>
			</section>
		</div>
	</article>
</main>

<style>
	section { scroll-margin-top: 6rem; }
	section + section { margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--border); }
	section > :global(* + *) { margin-top: 1.25rem; }
	section > h2 { margin-top: 0; }
</style>
