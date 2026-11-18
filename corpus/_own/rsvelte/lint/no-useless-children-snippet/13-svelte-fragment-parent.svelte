<script>
	import Comp from './01-component-basic.svelte';
</script>

<Comp>
	<svelte:fragment slot="body">
		{#snippet children()}
			<p>a</p>
		{/snippet}
	</svelte:fragment>
</Comp>
