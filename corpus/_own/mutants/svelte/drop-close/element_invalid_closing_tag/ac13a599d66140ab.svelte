<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	<Child let:message>
		<p>{message}</p>
	

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
