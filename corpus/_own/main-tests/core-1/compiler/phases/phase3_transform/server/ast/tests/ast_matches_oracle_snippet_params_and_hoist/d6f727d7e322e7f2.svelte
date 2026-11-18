<script>
	import Child from './Child.svelte';
</script>

<Child>
	{#snippet children({ foo })}
		Default {foo}
	{/snippet}
	{#snippet named({ bar })}
		Named {bar}
	{/snippet}
</Child>
