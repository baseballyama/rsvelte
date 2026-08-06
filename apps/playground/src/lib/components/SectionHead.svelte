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
		padding = '3rem 1.5rem 1.25rem',
		marginBottom = '0',
		fontSize = '1.5rem',
	}: Props = $props();
</script>

<div
	class="section-head"
	data-section={num}
	style="--sh-padding: {padding}; --sh-margin-bottom: {marginBottom}; --sh-font-size: {fontSize};"
>
	<h2>{@render children()}</h2>
	{#if lede}{@render lede()}{/if}
</div>

<style>
	.section-head {
		max-width: 1120px;
		margin: 0 auto var(--sh-margin-bottom);
		padding: var(--sh-padding);
		display: grid;
		grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 1.3fr);
		gap: 1rem 4rem;
		align-items: start;
	}

	h2 {
		font-family: var(--font-ui);
		font-weight: 650;
		font-size: var(--sh-font-size);
		line-height: 1.25;
		letter-spacing: -0.025em;
		color: var(--ink);
	}

	h2 :global(em) {
		font-style: normal;
		color: inherit;
	}

	.section-head > :global(.lede) {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}

	.section-head > :global(.clear-filter) {
		justify-self: start;
	}

	@media (max-width: 760px) {
		.section-head {
			grid-template-columns: 1fr;
			gap: 0.65rem;
			padding-inline: 1rem;
		}
	}
</style>
