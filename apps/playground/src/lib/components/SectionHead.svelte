<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		num: string;
		children: Snippet;
		lede?: Snippet;
		columns?: 2 | 3;
		padding?: string;
		marginBottom?: string;
		fontSize?: string;
	}

	let {
		num,
		children,
		lede,
		columns = 2,
		padding = 'clamp(3.5rem, 8vh, 5.5rem) clamp(1rem, 4vw, 2.5rem) clamp(1.4rem, 3vh, 2.4rem)',
		marginBottom = '0',
		fontSize = 'clamp(1.65rem, 3.2vw, 2.6rem)'
	}: Props = $props();
</script>

<div
	class="section-head"
	style="--sh-columns: {columns === 3
		? 'auto 1fr auto'
		: 'auto 1fr'}; --sh-padding: {padding}; --sh-margin-bottom: {marginBottom}; --sh-font-size: {fontSize};"
>
	<span class="num">{num}</span>
	<h2>{@render children()}</h2>
	{#if lede}{@render lede()}{/if}
</div>

<style>
	.section-head {
		max-width: 1080px;
		margin: 0 auto var(--sh-margin-bottom);
		padding: var(--sh-padding);
		display: grid;
		grid-template-columns: var(--sh-columns);
		gap: 0.4rem 1.4rem;
		align-items: baseline;
	}

	.num {
		grid-row: 1;
		grid-column: 1;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: var(--rust);
	}

	h2 {
		grid-row: 1;
		grid-column: 2;
		font-family: 'Hanken Grotesk', sans-serif;
		font-weight: 700;
		font-size: var(--sh-font-size);
		line-height: 1.1;
		letter-spacing: -0.022em;
		margin: 0;
		color: var(--ink);
	}

	h2 :global(em) {
		font-style: italic;
		color: var(--svelte);
		font-weight: 700;
	}

	.section-head > :global(.lede) {
		grid-row: 2;
		grid-column: 2;
		margin-top: 0.7rem;
	}

	.section-head > :global(.clear-filter) {
		grid-row: 1;
		grid-column: 3;
	}

	@media (max-width: 880px) {
		.section-head {
			grid-template-columns: auto 1fr;
		}

		.section-head > :global(.clear-filter) {
			grid-column: 1 / -1;
			justify-self: start;
		}
	}
</style>
