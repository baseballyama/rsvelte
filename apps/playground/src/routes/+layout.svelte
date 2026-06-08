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
		href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
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
		--paper: #f7f8fa;
		--paper-2: #eef1f4;
		--ink: #0f1419;
		--ink-soft: #4a5560;
		--ink-faint: #8b96a2;
		--rule: #e7eaee;
		--rule-strong: #d2d7dd;
		--selection: #ffe0cc;

		--svelte: #ff3e00;
		--svelte-hover: #e83700;
		/* Single accent is the Svelte orange; the former "rust" hue is now a
		   restrained cool slate so eyebrows / labels read as neutral. */
		--rust: #5c6773;
		--rust-soft: #8b96a2;

		--ok: #1f9d55;
		--warn: #b07a00;
		--bad: #d23a1f;

		/* Editor / monaco surface — cool off-white in light, lifted ink in dark */
		--editor-bg: #f7f8fa;
		--editor-ink: #0f1419;

		/* Blueprint-grid hairline, used for subtle technical backgrounds. */
		--grid: #eceff3;

		color-scheme: light;
	}

	:global(:root[data-theme='dark']) {
		--bg: #0e1116;
		--paper: #161b22;
		--paper-2: #1c232c;
		--ink: #e6edf3;
		--ink-soft: #9aa7b4;
		--ink-faint: #6b7681;
		--rule: #232b34;
		--rule-strong: #313b45;
		--selection: #5a2a10;

		--svelte: #ff6a39;
		--svelte-hover: #ff855c;
		--rust: #8b96a2;
		--rust-soft: #6b7681;

		--ok: #3fb950;
		--warn: #e0b240;
		--bad: #f0613f;

		--editor-bg: #0f141a;
		--editor-ink: #e6edf3;

		--grid: #1a212a;

		color-scheme: dark;
	}

	:global(body) {
		font-family: 'Hanken Grotesk', ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif;
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
		font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
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
