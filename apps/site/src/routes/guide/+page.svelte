<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Guide · rsvelte</title>
</svelte:head>

<h1>Guide</h1>

<h2 id="install">Install</h2>

<pre><code class="language-sh">npm install --save-dev @rsvelte/cli</code></pre>

<p>
	To use <code>typecheck</code>, also install a <a href="#typecheck">type checker</a>. In
	<code>package.json</code> scripts, the command is <code>rsvelte</code>:
</p>

<pre><code class="language-json"
		>{`{
  "scripts": {
    "lint": "rsvelte lint",
    "format": "rsvelte format",
    "typecheck": "rsvelte typecheck"
  }
}`}</code
	></pre>

<p>
	<code>rsvelte help</code> prints an overview. <code>rsvelte help lint</code> or
	<code>rsvelte lint --help</code> prints help for one command.
</p>

<h2 id="lint"><code>lint</code></h2>

<pre><code class="language-sh">rsvelte lint [path...]</code></pre>

<p>
	<code>lint</code> checks the Svelte, JavaScript and TypeScript files below each path. By default, the
	path is the current directory. It reads these extensions:
</p>

<ul class="inline">
	<li><code>.svelte</code></li>
	<li><code>.js</code></li>
	<li><code>.mjs</code></li>
	<li><code>.cjs</code></li>
	<li><code>.ts</code></li>
	<li><code>.mts</code></li>
	<li><code>.cts</code></li>
</ul>

<p>
	It skips <code>node_modules</code>, <code>.git</code>, and files that <code>.gitignore</code> or
	<code>.ignore</code> excludes, but it reads a file you name on the command line.
</p>

<p>
	It prints problems as ESLint's <code>stylish</code> formatter does. When you turn on a Svelte rule
	that also applies to scripts, such as <code>svelte/no-inspect</code>, it also checks
	<code>.jsx</code>
	and
	<code>.tsx</code> files.
</p>

<p>
	Without a configuration, these rules run. The <a href={resolve('/rules')}>rules page</a> lists the others.
</p>

<ul>
	<li>Svelte files: <code>no-unused-vars</code> and <code>svelte/button-has-type</code></li>
	<li>TypeScript and JavaScript files: <code>@typescript-eslint/no-unused-vars</code></li>
</ul>

<h2 id="format"><code>format</code></h2>

<pre><code class="language-sh">rsvelte format [path...] [--check]</code></pre>

<p>
	<code>format</code> is <a href="https://oxc.rs/docs/guide/usage/formatter">oxfmt</a>, the
	formatter of the oxc project, with a built-in Svelte formatter. It accepts oxfmt's options (<code
		>rsvelte format --help</code
	>). It reads its settings from <code>.oxfmtrc.json</code> and <code>.editorconfig</code>, and the
	files to skip from <code>.prettierignore</code>. With <code>--check</code>, it writes nothing and
	lists the files that need formatting.
</p>

<p>
	It formats each file that oxfmt formats itself, such as TypeScript, JSON, CSS and Markdown. It
	also formats the <code>svelte</code> code blocks in Markdown. It skips the files that oxfmt hands to
	Prettier.
</p>

<p>For Svelte files:</p>

<ul>
	<li>
		These options support only their default value:
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
		<code>sortImports</code> and <code>jsdoc</code> work in the scripts of Svelte files as they do
		in oxfmt.
		<code>sortTailwindcss</code> is not supported yet.
	</li>
	<li>
		With another value of these options, or with <code>sortTailwindcss</code>, <code>format</code> formats
		no Svelte file. It reports an error that names the option for each Svelte file, formats the other
		files, and exits with 2.
	</li>
	<li><code>"svelte": false</code> in <code>.oxfmtrc.json</code> turns Svelte formatting off.</li>
</ul>

<h2 id="typecheck"><code>typecheck</code></h2>

<pre><code class="language-sh">rsvelte typecheck</code></pre>

<p>
	<code>typecheck</code> type checks the files that a <code>tsconfig.json</code> selects, and
	reports the errors that svelte-check reports. It takes no paths. It prints one error per line, as
	<code>tsc --pretty false</code> does.
</p>

<p>
	It runs a TypeScript 7 type checker from the project's <code>node_modules</code>. Install one of
	these. The project also needs <code>svelte</code>.
</p>

<pre><code class="language-sh"
		>{`npm install --save-dev tsrs                         # recommended: a Rust port of TypeScript 7
npm install --save-dev typescript                   # 7.1 or newer
npm install --save-dev @typescript/native-preview   # 7.1 or newer`}</code
	></pre>

<p>
	The <code>typescript.check</code> entry of <code>rsvelte.config.json</code> (see
	<a href="#config">Configuration</a>) picks the <code>tsconfig.json</code>:
</p>

<ul>
	<li>
		No configuration file, or no <code>typescript.check</code>: the <code>tsconfig.json</code> in the
		current directory.
	</li>
	<li>
		<code>typescript.check</code> with <code>"tsconfig"</code>: the file at that path.
	</li>
	<li>
		<code>typescript.check</code> without <code>"tsconfig"</code>: the <code>tsconfig.json</code> next
		to the configuration file.
	</li>
</ul>

<h2 id="config">Configuration</h2>

<p>
	<code>lint</code> and <code>typecheck</code> read <code>rsvelte.config.json</code>. The file can
	also be a <code>rsvelte.config.js</code> or <code>rsvelte.config.ts</code>, which Node evaluates.
	rsvelte looks for the file in the current directory, then in each parent. Use
	<code>--config &lt;file&gt;</code> to choose a file. Two configuration files in one directory are an
	error.
</p>

<pre><code class="language-json"
		>{`{
  "plugins": {
    "svelte.lint": {
      "rules": { "no-unused-vars": "warn", "svelte/button-has-type": "error" }
    },
    "typescript.check": { "tsconfig": "tsconfig.app.json" }
  }
}`}</code
	></pre>

<p>Each key below <code>plugins</code> configures one part of rsvelte:</p>

<table>
	<thead>
		<tr><th>Key</th><th>Main options</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>svelte.lint</code></td>
			<td>
				<code>rules</code>: every rule but <code>@typescript-eslint/no-unused-vars</code>, with
				options as in ESLint. <code>languageOptions.globals</code>: the declared global variables.
			</td>
		</tr>
		<tr>
			<td><code>typescript.lint</code></td>
			<td><code>rules</code>: <code>@typescript-eslint/no-unused-vars</code></td>
		</tr>
		<tr>
			<td><code>typescript.check</code></td>
			<td>
				<code>command</code>: the type checker. Without it, rsvelte runs the first of
				<code>tsrs</code>, <code>@typescript/native-preview</code> and <code>typescript</code> that
				the project installs.
				<code>tsconfig</code>: the <code>tsconfig.json</code> to check.
			</td>
		</tr>
	</tbody>
</table>

<p>
	A <code>rules</code> object replaces the default rules of its key. Paths start from the directory
	of the configuration file. An unknown key is an error.
	<a
		href="https://github.com/baseballyama/rsvelte/blob/main/crates/hosts/configuration_loading/README.md"
		>The configuration reference</a
	> lists every option.
</p>

<h2 id="exit">Exit codes</h2>

<table>
	<thead>
		<tr><th>Command</th><th>1</th><th>2</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>lint</code>, <code>typecheck</code></td>
			<td>It found an error (warnings alone exit with 0)</td>
			<td>It could not run</td>
		</tr>
		<tr>
			<td><code>format</code></td>
			<td><code>--check</code> found a file to format, or the oxfmt configuration is invalid</td>
			<td>
				<code>format</code> failed on a file (for example, because of an unsupported Svelte option), or
				no path matched a file
			</td>
		</tr>
	</tbody>
</table>

<h2 id="eslint">With ESLint</h2>

<p>
	<a href="https://www.npmjs.com/package/@rsvelte/eslint-plugin">@rsvelte/eslint-plugin</a> turns
	off the ESLint rules that rsvelte implements, so you see each problem once. Use the version that
	matches
	<code>@rsvelte/cli</code>.
</p>

<pre><code class="language-sh">npm install --save-dev @rsvelte/eslint-plugin</code></pre>

<pre><code class="language-js"
		>{`// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import rsvelte from '@rsvelte/eslint-plugin';

export default [
  ...svelte.configs.recommended,
  ...rsvelte.configs['flat/recommended'], // last
];`}</code
	></pre>

<p>
	<code>flat/recommended</code> turns off the rules of the
	<a href={resolve('/rules') + '#correctness'}><code>correctness</code></a> category, and
	<code>flat/all</code> every rule outside the <code>nursery</code> category of rules in
	development. If ESLint no longer runs a rule and rsvelte does not run it either, nothing checks
	it. Turn on the rules you want under <code>rules</code> in <code>rsvelte.config.json</code>.
</p>

<p>A script that runs both: <code>"lint": "rsvelte lint && eslint"</code></p>

<h2 id="legacy">Svelte 4 and legacy mode</h2>

<p>
	rsvelte supports Svelte 5 components in runes mode only. A component that uses one of these is in
	legacy mode:
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
		<code>typecheck</code> gives wrong results for a component in legacy mode. For one without
		<code>&lt;script lang="ts"&gt;</code>, it can report no error at all.
	</li>
	<li>
		<code>lint</code> and <code>format</code> read legacy syntax, but their results can differ from the
		official tools.
	</li>
</ul>

<p>
	For a Svelte 4 project, use the official tools:
	<a href="https://www.npmjs.com/package/svelte-check">svelte-check</a>,
	<a href="https://www.npmjs.com/package/eslint-plugin-svelte">eslint-plugin-svelte</a> and
	<a href="https://www.npmjs.com/package/prettier-plugin-svelte">prettier-plugin-svelte</a>.
</p>
