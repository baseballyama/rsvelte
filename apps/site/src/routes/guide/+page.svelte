<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>使い方 ・ rsvelte</title>
</svelte:head>

<h1>使い方</h1>

<h2 id="install">インストール</h2>

<pre><code>npm install --save-dev @rsvelte/cli</code></pre>

<p><code>package.json</code> のスクリプトでは、コマンド名は <code>rsvelte</code> です。</p>

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
	を検査します。パスを省くと、現在のディレクトリが対象です。<code>node_modules</code>
	と、<code>.gitignore</code> が除外するファイルは読みません。問題は ESLint の
	<code>stylish</code> 形式で表示します。
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
	<code>format</code> は <a href="https://oxc.rs/docs/guide/usage/formatter">oxfmt</a>
	に Svelte の整形を組み込んだコマンドです。オプションは oxfmt と同じです（<code
		>rsvelte format --help</code
	>）。設定は oxfmt と同じく <code>.oxfmtrc.json</code>、<code>.editorconfig</code>、<code
		>.prettierignore</code
	>
	から読みます。<code>--check</code> を付けると、ファイルを書き換えずに、整形が必要なファイルを表示します。
</p>

<p>
	TypeScript、JSON、CSS、Markdown など、oxfmt が Rust で整形するファイルを整形します。oxfmt が
	Prettier に任せるファイルは飛ばします。<code>format</code> は Prettier を動かしません。
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
		対応していない設定があると、Svelte ファイルごとにエラーを出し、ほかのファイルは整形します。
	</li>
	<li>設定ファイルに <code>"svelte": false</code> と書くと、Svelte ファイルを整形しません。</li>
</ul>

<p><code>rsvelte.config</code> は <code>format</code> には効きません。</p>

<h2 id="typecheck">typecheck：型検査する</h2>

<pre><code>rsvelte typecheck</code></pre>

<p>
	<code>tsconfig.json</code> が選ぶファイルを型検査し、svelte-check と同じエラーを報告します。読む
	<code>tsconfig.json</code> は現在のディレクトリのものです。<code>rsvelte.config</code> に
	<code>typescript.check</code> の設定があれば、<code>rsvelte.config</code> の隣のものを読みます。
</p>

<p>
	型検査には、プロジェクトの <code>node_modules</code> にある TypeScript 7 の型検査器を使います。次のどれかをインストールしてください。
</p>

<pre><code
		>{`npm install --save-dev tsrs                         # おすすめ
npm install --save-dev typescript                   # 7.1 以降
npm install --save-dev @typescript/native-preview   # 7.1 以降`}</code
	></pre>

<h2 id="config">設定</h2>

<p>
	<code>lint</code> と <code>typecheck</code> は <code>rsvelte.config.json</code> を読みます（<code
		>.js</code
	>
	や <code>.ts</code>
	なども使えます）。現在のディレクトリから親へたどって、最初に見つかったファイルを使います。各プラグインは
	<code>plugins</code> の下から自分の設定を読みます。
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

<table>
	<thead>
		<tr><th>プラグイン</th><th>設定</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>svelte.lint</code></td>
			<td>
				Svelte ファイルのルール（<code>rules</code>）と、宣言済みのグローバル変数（<code
					>languageOptions.globals</code
				>）
			</td>
		</tr>
		<tr
			><td><code>typescript.lint</code></td><td
				>TypeScript と JavaScript のファイルのルール（<code>rules</code>）</td
			></tr
		>
		<tr
			><td><code>typescript.check</code></td><td
				>型検査器のコマンド（<code>command</code>）と <code>tsconfig</code></td
			></tr
		>
	</tbody>
</table>

<p>
	<code>rules</code> を書くと、既定のルールは使われず、書いたルールだけが動きます。設定の中のパスは、設定ファイルのディレクトリから数えます。
</p>

<h2 id="exit">終了コード</h2>

<table>
	<thead>
		<tr><th>コマンド</th><th>1</th><th>2</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>lint</code>、<code>typecheck</code></td>
			<td>エラーを見つけた</td>
			<td>実行できなかった</td>
		</tr>
		<tr>
			<td><code>format</code></td>
			<td><code>--check</code> で未整形のファイルを見つけた、または設定が不正</td>
			<td>整形できないファイルがあった、またはパスに合うファイルがない</td>
		</tr>
	</tbody>
</table>

<h2 id="eslint">ESLint と併用する</h2>

<p>
	<a href="https://www.npmjs.com/package/@rsvelte/eslint-plugin">@rsvelte/eslint-plugin</a>
	は、rsvelte が実装したルールを ESLint で無効にします。同じ問題が二重に報告されなくなります。
</p>

<pre><code
		>{`// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import rsvelte from '@rsvelte/eslint-plugin';

export default [
  ...svelte.configs.recommended,
  ...rsvelte.configs['flat/recommended'], // 最後に置く
];`}</code
	></pre>

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
	<li><code>typecheck</code> はレガシーモードのコンポーネントで正しい結果を出しません。</li>
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
