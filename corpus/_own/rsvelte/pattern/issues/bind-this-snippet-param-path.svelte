<script>
	let { boxes } = $props();
</script>

{#snippet row(depth)}
	<div bind:this={boxes[depth]}></div>
{/snippet}

{@render row(0)}
