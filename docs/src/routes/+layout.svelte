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

	:global(body) {
		font-family: 'Overpass', ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif;
		background: #ffffff;
		color: #14130f;
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
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
		background: #ffe9d6;
		color: #14130f;
	}
</style>
