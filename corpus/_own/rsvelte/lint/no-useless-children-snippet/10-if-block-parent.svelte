<script>
	import Comp from './01-component-basic.svelte';
	let cond = true;
</script>

<Comp>
	{#if cond}
		{#snippet children()}
			<p>a</p>
		{/snippet}
	{/if}
</Comp>
