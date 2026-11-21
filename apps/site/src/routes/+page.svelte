<script lang="ts">
	import { resolve } from '$app/paths';
	import Logo from '#lib/Logo.svelte';
</script>

<svelte:head>
	<title>rsvelte</title>
	<meta
		name="description"
		content="Lint, format and type check Svelte 5 with native tools in Rust"
	/>
</svelte:head>

<section class="hero">
	<Logo size="4.5rem" />
	<div>
		<h1>rsvelte</h1>
		<p class="lead">Lint, format and type check Svelte 5 with native tools written in Rust.</p>
	</div>
</section>

<p>This release is experimental. Its results can differ from those of the official tools.</p>

<pre><code class="language-sh"
		>npm install --save-dev @rsvelte/cli
npx @rsvelte/cli lint
npx @rsvelte/cli format
npx @rsvelte/cli typecheck</code
	></pre>

<p>
	<code>typecheck</code> runs a TypeScript 7 type checker that you install, such as
	<a href={resolve('/guide') + '#typecheck'}>tsrs</a>, a port of TypeScript to Rust.
</p>

<div class="cards">
	<div>
		<h3><code>lint</code></h3>
		<p>
			Reports problems with rules ported from eslint-plugin-svelte, ESLint and typescript-eslint.
		</p>
	</div>
	<div>
		<h3><code>format</code></h3>
		<p>
			Formats files with oxfmt, the formatter of the oxc project, extended with a Svelte formatter.
		</p>
	</div>
	<div>
		<h3><code>typecheck</code></h3>
		<p>Reports the type errors that svelte-check reports.</p>
	</div>
</div>

<p>
	rsvelte checks Svelte 5 components in runes mode, plus TypeScript and JavaScript files.
	<a href={resolve('/guide') + '#legacy'}>It does not support Svelte 4.</a>
</p>

<p>
	Read the <a href={resolve('/guide')}>guide</a> to start, or try rsvelte in the
	<a href={resolve('/playground')}>playground</a> without installing it.
</p>

<style>
	.hero {
		display: flex;
		gap: 1.25rem;
		align-items: center;
		margin: 2.5rem 0 1.5rem;
	}

	h1 {
		margin: 0;
		font-size: 2.6rem;
	}

	.lead {
		margin: 0.25rem 0 0;
		font-size: 1.15rem;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 1rem;
		margin: 1.5rem 0;
	}

	.cards > div {
		padding: 0 1rem;
		border: 1px solid var(--line);
		border-radius: 8px;
	}
</style>
