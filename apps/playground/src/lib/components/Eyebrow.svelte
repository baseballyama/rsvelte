<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: string;
		fontSize?: string;
		letterSpacing?: string;
		marginBottom?: string;
		ruleWidth?: string;
		uppercase?: boolean;
	}

	let {
		children,
		gap = '0.7rem',
		fontSize = '0.75rem',
		letterSpacing = '0.08em',
		marginBottom = '0',
		ruleWidth = '24px',
		uppercase = false,
	}: Props = $props();
</script>

<p
	class="eyebrow"
	style="--eyebrow-gap: {gap}; --eyebrow-font-size: {fontSize}; --eyebrow-letter-spacing: {letterSpacing}; --eyebrow-margin-bottom: {marginBottom}; --eyebrow-rule-width: {ruleWidth}; --eyebrow-text-transform: {uppercase
		? 'uppercase'
		: 'none'};"
>
	{@render children()}
</p>

<style>
	.eyebrow {
		display: inline-block;
		font-family: var(--font-ui);
		font-size: var(--eyebrow-font-size);
		font-weight: 600;
		letter-spacing: 0;
		text-transform: var(--eyebrow-text-transform);
		color: var(--ink-soft);
		margin: 0 0 var(--eyebrow-margin-bottom);
	}
</style>
