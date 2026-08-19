<script>
	import C from './01-basic.svelte';
</script>

<svelte:body style="color: red" />
<svelte:window style="color: red" />
<svelte:document style:color="red" />
<C>
	<svelte:fragment slot="body">
		<span style="color: red">reported host is html</span>
	</svelte:fragment>
</C>
