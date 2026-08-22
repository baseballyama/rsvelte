<script>
	import { writable } from 'svelte/store';
	const stateStore = writable(0);
</script>

{#if $stateStore != null}
	{@const seen = $stateStore + 1}
	<span>{seen}</span>
{/if}
