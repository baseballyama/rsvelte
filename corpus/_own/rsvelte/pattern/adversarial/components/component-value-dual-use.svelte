<script>
	import Fallback from './Fallback.svelte';

	let registry = $state(new Map([['a', Fallback]]));
	let name = $state('a');
	let Chosen = $derived(registry.get(name) ?? Fallback);
	let meta = $derived({ ctor: Chosen, count: registry.size });
</script>

<Chosen tag={meta.ctor === Fallback ? 'fb' : 'other'} />

{#if meta.ctor}
	{@const Alias = meta.ctor}
	<Alias via="const" />
{/if}
