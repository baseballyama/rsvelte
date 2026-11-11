<script>
	import Canvas from './Canvas.svelte';
	let { children, ...restProps } = $props();
</script>

<Canvas {...restProps}>
	{#snippet children(props)}
		{@render children?.(props)}
	{/snippet}
</Canvas>
