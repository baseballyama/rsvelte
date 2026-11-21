<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>使い方 ・ rsvelte</title>
</svelte:head>

<h1>使い方</h1>

<h2 id="install">インストール</h2>

<pre><code>npm install --save-dev @rsvelte/cli</code></pre>

<p>
	<code>typecheck</code> を使うときは、<a href="#typecheck">型検査器</a
	>もインストールしてください。<code>package.json</code> のスクリプトでは、コマンド名は
	<code>rsvelte</code> です。
</p>

<pre><code
		>{`{
  "scripts": {
    "lint": "rsvelte lint",
    "format": "rsvelte format",
    "typecheck": "rsvelte typecheck"
  }
}`}</code
	></pre>

<p>
	<code>rsvelte help</code> で全体の説明を、<code>rsvelte help lint</code> のようにコマンド名を付けるとそのコマンドの説明を表示します。
</p>

<h2 id="lint">lint：コードを検査する</h2>

<pre><code>rsvelte lint [パス...]</code></pre>

<p>
	パスより下にある <code>.svelte</code>、<code>.js</code>、<code>.mjs</code>、<code>.cjs</code
	>、<code>.ts</code>、<code>.mts</code>、<code>.cts</code>
	を検査します。パスを省くと、現在のディレクトリが対象です。<code>node_modules</code>、<code
		>.git</code
	>
	と、<code>.gitignore</code> や <code>.ignore</code> が除外するファイルは読みません。ただし、コマンドラインで名前を指定したファイルは読みます。
</p>

<p>
	問題は、ESLint の既定の表示形式（<code>stylish</code>）で表示します。<code>svelte/no-inspect</code
	>
	のように JavaScript にも効く Svelte のルールを有効にすると、<code>.jsx</code> と
	<code>.tsx</code> も検査します。
</p>

<p>
	設定がなければ、次のルールが動きます。ほかのルールは<a href={resolve('/rules')}>ルール一覧</a
	>にあります。
</p>

<ul>
	<li>Svelte ファイル：<code>no-unused-vars</code>、<code>svelte/button-has-type</code></li>
	<li>TypeScript と JavaScript のファイル：<code>@typescript-eslint/no-unused-vars</code></li>
</ul>

<h2 id="format">format：整形する</h2>

<pre><code>rsvelte format [パス...] [--check]</code></pre>

<p>
	<code>format</code> は、oxc の整形ツール
	<a href="https://oxc.rs/docs/guide/usage/formatter">oxfmt</a>
	に Svelte の整形を組み込んだコマンドです。オプションは oxfmt と同じです（<code
		>rsvelte format --help</code
	>）。設定は <code>.oxfmtrc.json</code> と <code>.editorconfig</code> から、除外するファイルは
	<code>.prettierignore</code>
	から読みます。<code>--check</code> を付けると、ファイルを書き換えずに、整形が必要なファイルを表示します。
</p>

<p>
	TypeScript、JSON、CSS、Markdown など、oxfmt が Rust で整形するファイルを整形します。oxfmt
	自身が整形せず Prettier に任せる種類のファイルは飛ばします。
</p>

<p>Svelte ファイルの整形には、次の制限があります。</p>

<ul>
	<li>
		次のオプションは既定値にだけ対応します。
		<ul class="inline">
			<li><code>semi</code></li>
			<li><code>singleQuote</code></li>
			<li><code>trailingComma</code></li>
			<li><code>arrowParens</code></li>
			<li><code>bracketSpacing</code></li>
			<li><code>quoteProps</code></li>
			<li><code>objectWrap</code></li>
		</ul>
	</li>
	<li>
		<code>sortImports</code>、<code>sortTailwindcss</code>、<code>jsdoc</code> にはまだ対応していません。
	</li>
	<li>
		対応していない設定があると、どの Svelte
		ファイルも整形せず、ファイルごとにその設定の名前をエラーで示します。Svelte
		以外のファイルは整形します。終了コードは 2 です。
	</li>
	<li>
		<code>.oxfmtrc.json</code> に <code>"svelte": false</code> と書くと、Svelte ファイルを整形しません。
	</li>
</ul>

<p>
	rsvelte の<a href="#config">設定ファイル</a>（<code>rsvelte.config.json</code>）は
	<code>format</code> には効きません。
</p>

<h2 id="typecheck">typecheck：型検査する</h2>

<pre><code>rsvelte typecheck</code></pre>

<p>
	<code>tsconfig.json</code> が選ぶファイルを型検査し、svelte-check
	と同じエラーを報告します。パスは指定できません。エラーは、<code>tsc --pretty false</code> と同じ形で
	1 行に 1 つずつ表示します。
</p>

<p>読む <code>tsconfig.json</code> は、<a href="#config">設定ファイル</a>によって決まります。</p>

<ul>
	<li><code>typescript.check</code> がない：現在のディレクトリの <code>tsconfig.json</code></li>
	<li>
		<code>typescript.check</code> に <code>"tsconfig"</code> がある：そこに書いたパスのファイル
	</li>
	<li>
		<code>typescript.check</code> に <code>"tsconfig"</code>
		がない：設定ファイルと同じディレクトリの
		<code>tsconfig.json</code>
	</li>
</ul>

<p>
	型検査には、プロジェクトの <code>node_modules</code> にある TypeScript 7
	の型検査器を使います。次のどれかをインストールしてください。プロジェクトには <code>svelte</code> も必要です。
</p>

<pre><code
		>{`npm install --save-dev tsrs                         # おすすめ（TypeScript 7 の Rust 移植）
npm install --save-dev typescript                   # 7.1 以降
npm install --save-dev @typescript/native-preview   # 7.1 以降`}</code
	></pre>

<h2 id="config">設定</h2>

<p>
	<code>lint</code> と <code>typecheck</code> は、rsvelte の設定ファイル
	<code>rsvelte.config.json</code> を読みます。<code>rsvelte.config.js</code> や
	<code>rsvelte.config.ts</code> も使え、Node
	で評価します。現在のディレクトリから親へたどり、最初に見つかったファイルを使います。<code
		>--config &lt;ファイル&gt;</code
	>
	でも指定できます。
</p>

<pre><code
		>{`{
  "plugins": {
    "svelte.lint": {
      "rules": { "no-unused-vars": "warn", "svelte/button-has-type": "error" }
    },
    "typescript.check": { "tsconfig": "tsconfig.app.json" }
  }
}`}</code
	></pre>

<p>設定は <code>plugins</code> の下に、処理ごとのキーで書きます。</p>

<table>
	<thead>
		<tr><th>キー</th><th>主な設定</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>svelte.lint</code></td>
			<td>
				<code>@typescript-eslint/no-unused-vars</code> 以外の全ルール（<code>rules</code>）。ESLint
				と同じく、ルールにオプションを渡せます。宣言済みのグローバル変数（<code
					>languageOptions.globals</code
				>）
			</td>
		</tr>
		<tr>
			<td><code>typescript.lint</code></td>
			<td><code>@typescript-eslint/no-unused-vars</code>（<code>rules</code>）</td>
		</tr>
		<tr>
			<td><code>typescript.check</code></td>
			<td>型検査器のコマンド（<code>command</code>）と <code>tsconfig</code></td>
		</tr>
	</tbody>
</table>

<p>
	キーの下に <code>rules</code>
	を書くと、そのキーの既定のルールは使われず、書いたルールだけが動きます。設定の中のパスは、設定ファイルのディレクトリを基準にします。知らないキーはエラーになります。全項目は<a
		href="https://github.com/baseballyama/rsvelte/blob/main/crates/hosts/configuration_loading/README.md"
		>設定の説明</a
	>（英語）にあります。
</p>

<h2 id="exit">終了コード</h2>

<table>
	<thead>
		<tr><th>コマンド</th><th>1</th><th>2</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>lint</code>、<code>typecheck</code></td>
			<td>エラーを見つけた（警告だけなら 0）</td>
			<td>実行できなかった</td>
		</tr>
		<tr>
			<td><code>format</code></td>
			<td><code>--check</code> で未整形のファイルを見つけた、または oxfmt の設定が不正</td>
			<td>
				整形できないファイルがあった（Svelte
				の整形が対応していない設定を含む）、またはパスに合うファイルがない
			</td>
		</tr>
	</tbody>
</table>

<h2 id="eslint">ESLint と併用する</h2>

<p>
	<a href="https://www.npmjs.com/package/@rsvelte/eslint-plugin">@rsvelte/eslint-plugin</a>
	は、rsvelte が実装したルールを ESLint で無効にする設定を提供します。同じ問題が二重に報告されなくなります。<code
		>@rsvelte/cli</code
	> と同じバージョンを使ってください。
</p>

<pre><code>npm install --save-dev @rsvelte/eslint-plugin</code></pre>

<pre><code
		>{`// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import rsvelte from '@rsvelte/eslint-plugin';

export default [
  ...svelte.configs.recommended,
  ...rsvelte.configs['flat/recommended'], // 最後に置く
];`}</code
	></pre>

<p>
	<code>flat/recommended</code> は
	<a href={resolve('/rules') + '#correctness'}><code>correctness</code></a
	>（誤りや無意味なコード）に分類されたルールを ESLint で無効にします。<code>flat/all</code>
	は、開発中（<code>nursery</code
	>）以外の全ルールを無効にします。無効にしたルールのうち使いたいものは、<code
		>rsvelte.config.json</code
	>
	で有効にしてください。有効にしないと、そのルールはどちらでも動きません。
</p>

<p>スクリプトでは rsvelte を先に動かします：<code>"lint": "rsvelte lint && eslint"</code></p>

<h2 id="legacy">Svelte 4 とレガシーモード</h2>

<p>
	rsvelte はルーンモードの Svelte 5
	コンポーネントだけに対応します。次のどれかを使うコンポーネントは、レガシーモードです。
</p>

<ul class="inline">
	<li><code>export let</code></li>
	<li><code>$:</code></li>
	<li><code>$$props</code></li>
	<li><code>$$restProps</code></li>
	<li><code>&lt;svelte:options runes=&#123;false&#125; /&gt;</code></li>
</ul>

<ul>
	<li>
		<code>typecheck</code> はレガシーモードのコンポーネントで正しい結果を出しません。<code
			>&lt;script lang="ts"&gt;</code
		>
		を使わないコンポーネントでは、エラーを 1 つも報告しないこともあります。
	</li>
	<li>
		<code>lint</code> と <code>format</code> は読めますが、結果が公式ツールと異なる場合があります。
	</li>
</ul>

<p>Svelte 4 のプロジェクトには、次の公式ツールを使ってください。</p>

<ul class="inline">
	<li><a href="https://www.npmjs.com/package/svelte-check">svelte-check</a></li>
	<li><a href="https://www.npmjs.com/package/eslint-plugin-svelte">eslint-plugin-svelte</a></li>
	<li><a href="https://www.npmjs.com/package/prettier-plugin-svelte">prettier-plugin-svelte</a></li>
</ul>
