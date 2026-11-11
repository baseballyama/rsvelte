<script>
	import C from './01-basic.svelte';
</script>

<C>
	<svelte:fragment slot="footer">
		<options />
	</svelte:fragment>
	<element />
</C>
