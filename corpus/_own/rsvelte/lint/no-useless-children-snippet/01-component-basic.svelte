<script>
	import Comp from './02-named-and-params.svelte';
</script>

<Comp>
	{#snippet children()}
		<p>hi</p>
	{/snippet}
</Comp>
