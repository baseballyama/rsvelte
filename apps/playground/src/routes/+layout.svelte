<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;500;600;700;800&family=Fira+Mono:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	/* =================================================================
	   THEME TOKENS — light (default)
	   =================================================================
	   Anything off-white/colored on the site should resolve through one
	   of these names. Dark mode just overrides the same names in the
	   `data-theme="dark"` block below, so pages never need to special-case.
	*/
	:global(:root),
	:global(:root[data-theme='light']) {
		--bg: #ffffff;
		--paper: #faf9f5;
		--paper-2: #f3f1e9;
		--ink: #14130f;
		--ink-soft: #5a5750;
		--ink-faint: #97938a;
		--rule: #ececdf;
		--rule-strong: #d8d4c4;
		--selection: #ffe9d6;

		--svelte: #ff3e00;
		--svelte-hover: #e83700;
		--rust: #b7410e;
		--rust-soft: #cf7a4a;

		--ok: #2c7a3a;
		--warn: #b07a00;
		--bad: #b1280a;

		/* Editor / monaco surface — slightly off-white in light, lifted ink in dark */
		--editor-bg: #fbf9f2;
		--editor-ink: #14130f;

		color-scheme: light;
	}

	:global(:root[data-theme='dark']) {
		--bg: #0d0c09;
		--paper: #16140f;
		--paper-2: #1d1a13;
		--ink: #f1ecdf;
		--ink-soft: #b0a994;
		--ink-faint: #75705f;
		--rule: #2a2620;
		--rule-strong: #3a3528;
		--selection: #5a2a10;

		--svelte: #ff6634;
		--svelte-hover: #ff7d50;
		--rust: #e58050;
		--rust-soft: #c46640;

		--ok: #6cc870;
		--warn: #e0b240;
		--bad: #e85a3c;

		--editor-bg: #14110b;
		--editor-ink: #efe9da;

		color-scheme: dark;
	}

	:global(body) {
		font-family: 'Overpass', ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif;
		background: var(--bg);
		color: var(--ink);
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	:global(code),
	:global(pre) {
		font-family: 'Fira Mono', ui-monospace, 'SF Mono', Menlo, monospace;
	}

	:global(::selection) {
		background: var(--selection);
		color: var(--ink);
	}

	/* Don't animate theme transitions on first paint or for users who
	   asked the OS not to. */
	@media (prefers-reduced-motion: reduce) {
		:global(body) {
			transition: none;
		}
	}
</style>
