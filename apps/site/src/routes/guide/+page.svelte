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

<pre><code class="language-sh">rsvelte lint [oxlint options] [path...]</code></pre>

<p>
	<code>lint</code> is <a href="https://oxc.rs/docs/guide/usage/linter">oxlint</a> with a built-in
	Svelte linter. It takes oxlint's options (<code>rsvelte lint --help</code>), reads oxlint's
	configuration, <code>.oxlintrc.json</code>, and prints and exits as oxlint does. oxlint checks
	each file it checks, and the scripts of each <code>.svelte</code> file, with its own rules. The
	Svelte linter checks the whole <code>.svelte</code> file with the <code>svelte/</code> rules, and
	runs
	<code>no-unused-vars</code> and <code>no-undef</code> there instead of oxlint, because they read the
	template.
</p>

<p>
	The configuration turns Svelte rules on and off as it does oxlint's, under the
	<code>svelte/</code> prefix, with no <code>plugins</code> entry. Each rule has one of oxlint's
	<a href={resolve('/rules')}>categories</a>, and by default only <code>correctness</code> runs:
</p>

<pre><code class="language-json"
		>{`{
  "categories": { "suspicious": "warn" },
  "env": { "browser": true },
  "rules": { "svelte/no-at-html-tags": "error", "svelte/no-inspect": "off" },
  "settings": { "svelte": { "ignoreWarnings": ["a11y_autofocus"] } }
}`}</code
	></pre>

<p>
	The Svelte linter reads <code>settings.svelte</code> as eslint-plugin-svelte does, the globals of
	<code>env</code> and <code>globals</code>, and the nearest <code>svelte.config.js</code>. A Svelte
	rule that also applies to scripts, such as <code>svelte/no-inspect</code>, also checks JavaScript
	and TypeScript files. In <code>.svelte.js</code> and <code>.svelte.ts</code> modules, oxlint's rules
	read the runes as globals.
</p>

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
	<code>typecheck</code> reads <code>rsvelte.config.json</code>. The file can also be a
	<code>rsvelte.config.js</code> or <code>rsvelte.config.ts</code>, which Node evaluates. rsvelte
	looks for the file in the current directory, then in each parent. Use
	<code>--config &lt;file&gt;</code> to choose a file. Two configuration files in one directory are
	an error. <code>lint</code> reads <code>.oxlintrc.json</code> and <code>format</code> reads
	<code>.oxfmtrc.json</code> instead.
</p>

<pre><code class="language-json"
		>{`{
  "plugins": {
    "typescript.check": { "tsconfig": "tsconfig.app.json" }
  }
}`}</code
	></pre>

<p>
	<code>typescript.check</code> takes <code>command</code>, the type checker. Without it, rsvelte
	runs the first of <code>tsrs</code>, <code>@typescript/native-preview</code> and
	<code>typescript</code> that the project installs. It also takes <code>tsconfig</code>, the
	<code>tsconfig.json</code> to check. Paths start from the directory of the configuration file. An
	unknown key is an error.
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
			<td><code>lint</code></td>
			<td>
				It found an error, or a warning with <code>--deny-warnings</code>, or the oxlint
				configuration is invalid
			</td>
			<td>-</td>
		</tr>
		<tr>
			<td><code>typecheck</code></td>
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
	off the ESLint rules that rsvelte adds to oxlint, and
	<a href="https://www.npmjs.com/package/eslint-plugin-oxlint">eslint-plugin-oxlint</a> those of
	oxlint, so you see each problem once. Use the version of <code>@rsvelte/eslint-plugin</code> that
	matches <code>@rsvelte/cli</code>.
</p>

<pre><code class="language-sh"
		>npm install --save-dev @rsvelte/eslint-plugin eslint-plugin-oxlint</code
	></pre>

<pre><code class="language-js"
		>{`// eslint.config.js
import svelte from 'eslint-plugin-svelte';
import oxlint from 'eslint-plugin-oxlint';
import rsvelte from '@rsvelte/eslint-plugin';

export default [
  ...svelte.configs.recommended,
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
  ...rsvelte.buildFromOxlintConfigFile('./.oxlintrc.json'), // last
];`}</code
	></pre>

<p>
	Each turns off the rules your <code>.oxlintrc.json</code> turns on.
	<code>rsvelte.configs['flat/recommended']</code> instead turns off the rules of the
	<a href={resolve('/rules') + '#correctness'}><code>correctness</code></a> category, and
	<code>flat/all</code> every rule outside the <code>nursery</code> category of rules in development.
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
