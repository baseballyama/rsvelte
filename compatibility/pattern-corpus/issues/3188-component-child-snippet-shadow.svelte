<script>
	import C from './C.svelte';
	let o = $state(1);
	let d = $derived(o * 2);
	let plain = 7;
</script>

<C>
	{#snippet a(o)}<b>{o}</b>{/snippet}
	{#snippet b(d)}<i>{d}</i>{/snippet}
	{#snippet c({ plain })}<u>{plain}</u>{/snippet}
	{#snippet e(o = 9)}<s>{o}</s>{/snippet}
</C>

{#snippet root(o)}<em>{o}</em>{/snippet}
{@render root(4)}
