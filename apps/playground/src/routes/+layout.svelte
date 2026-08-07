<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body),
	:global(h1),
	:global(h2),
	:global(h3),
	:global(p),
	:global(dl),
	:global(dd),
	:global(figure) {
		margin: 0;
	}

	:global(:root),
	:global(:root[data-theme='light']) {
		--bg: #ffffff;
		--paper: #f6f8fa;
		--paper-2: #eef1f4;
		--ink: #1f2328;
		--ink-soft: #59636e;
		--ink-faint: #818b98;
		--rule: #d8dee4;
		--rule-strong: #afb8c1;
		--selection: #ffd2c2;
		--accent: #ff3e00;
		--accent-hover: #d63300;
		--chrome: #ffffff;
		--chrome-ink: #1f2328;
		--chrome-soft: #59636e;

		--font-display: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		--font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		--font-code: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;

		--svelte: var(--accent);
		--svelte-hover: var(--accent-hover);
		--rust: #8250df;
		--rust-soft: #a475d9;
		--ok: #1a7f37;
		--warn: #9a6700;
		--bad: #cf222e;

		--editor-bg: #f6f8fa;
		--editor-ink: #1f2328;
		--grid: #eaeef2;
		--syntax-key: #8250df;
		--syntax-string: #0a3069;
		--syntax-number: #0550ae;
		--code-bg: #24292f;
		--code-ink: #f6f8fa;
		--code-muted: #8c959f;

		color-scheme: light;
	}

	:global(:root[data-theme='dark']) {
		--bg: #0d1117;
		--paper: #161b22;
		--paper-2: #21262d;
		--ink: #f0f3f6;
		--ink-soft: #b1bac4;
		--ink-faint: #7d8590;
		--rule: #30363d;
		--rule-strong: #484f58;
		--selection: #773018;
		--accent: #ff5a24;
		--accent-hover: #ff7a4d;
		--chrome: #0d1117;
		--chrome-ink: #f0f3f6;
		--chrome-soft: #b1bac4;

		--svelte: var(--accent);
		--svelte-hover: var(--accent-hover);
		--rust: #d2a8ff;
		--rust-soft: #bc8cff;
		--ok: #3fb950;
		--warn: #d29922;
		--bad: #f85149;

		--editor-bg: #161b22;
		--editor-ink: #f0f3f6;
		--grid: #21262d;
		--syntax-key: #d2a8ff;
		--syntax-string: #a5d6ff;
		--syntax-number: #79c0ff;
		--code-bg: #161b22;
		--code-ink: #f0f3f6;
		--code-muted: #7d8590;

		color-scheme: dark;
	}

	:global(body) {
		min-width: 320px;
		margin: 0;
		font-family: var(--font-ui);
		font-size: 16px;
		line-height: 1.5;
		background: var(--bg);
		color: var(--ink);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	:global(button),
	:global(input),
	:global(select),
	:global(textarea) {
		font: inherit;
	}

	:global(code),
	:global(pre) {
		font-family: var(--font-code);
	}

	:global(::selection) {
		background: var(--selection);
	}
</style>
