<script>
	import C from './C.svelte';
	let selected = $state([]);
	let one = $state('a');
	let v = $state('x');
	let items = $state([{ picks: [] }]);
	let binding_group = 1;
</script>
<input type="checkbox" bind:group={selected} value="a" />
<input type="checkbox" bind:group={selected} value={v} />
<input type="radio" bind:group={one} value="b" />
<input type="radio" bind:group={one} />
{#each items as item, i}
	<input type="checkbox" bind:group={item.picks} value="p" />
	{#each [1, 2] as n (n)}
		<input type="checkbox" bind:group={items[i].picks} value={n} />
	{/each}
{/each}
{#each items as item, j (item)}
	<input type="radio" bind:group={item.picks} value={j} />
{/each}
<C bind:group={one} />
