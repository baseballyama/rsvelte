<script>
	import Comp from './01-component-basic.svelte';
</script>

<svelte:component this={Comp}>
	{#snippet children()}
		<p>hi</p>
	{/snippet}
</svelte:component>
