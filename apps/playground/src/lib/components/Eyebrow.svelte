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
		uppercase = true
	}: Props = $props();
</script>

<p
	class="eyebrow"
	style="--eyebrow-gap: {gap}; --eyebrow-font-size: {fontSize}; --eyebrow-letter-spacing: {letterSpacing}; --eyebrow-margin-bottom: {marginBottom}; --eyebrow-rule-width: {ruleWidth}; --eyebrow-text-transform: {uppercase
		? 'uppercase'
		: 'none'};"
>
	<span class="rule"></span>{@render children()}
</p>

<style>
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: var(--eyebrow-gap);
		font-family: 'JetBrains Mono', monospace;
		font-size: var(--eyebrow-font-size);
		letter-spacing: var(--eyebrow-letter-spacing);
		text-transform: var(--eyebrow-text-transform);
		color: var(--rust);
		margin: 0 0 var(--eyebrow-margin-bottom);
	}

	.eyebrow .rule {
		display: inline-block;
		width: var(--eyebrow-rule-width);
		height: 1px;
		background: var(--rust);
	}
</style>
