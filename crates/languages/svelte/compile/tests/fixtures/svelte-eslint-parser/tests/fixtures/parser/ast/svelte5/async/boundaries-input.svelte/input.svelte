<script>
	import MyApp from './MyApp.svelte';
</script>

<svelte:boundary>
	<MyApp />

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>