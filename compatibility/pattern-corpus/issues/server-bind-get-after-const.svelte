<script>
	import Child from './Child.svelte';
	let open = $state(null);
	let items = $state([1, 2]);
	let tag = $state('div');
</script>

{#snippet row()}
	{@const id = crypto.randomUUID()}
	<Child bind:open={() => open === id, () => (open = id)} />
{/snippet}
{@render row()}

{#each items as item, i}
	{@const label = String(item)}
	<div><Child bind:value={() => label, (v) => (items[i] = v)} /></div>
	{@const other = label + '!'}
	<Child bind:value={() => other, (v) => (items[i] = v)} />
{/each}

<Child bind:open={() => open, (v) => (open = v)}>
	<p>child</p>
	{@const nested = open}
	<Child bind:open={() => nested, (v) => (open = v)} />
</Child>

{#each items as item, i}
	<svelte:element this={tag} />
	{@const k = item}
	<Child bind:value={() => k, (v) => (items[i] = v)} />
	<svelte:element this={'s' + tag} />
{/each}

<div>
	{const doubled = 2}
	<Child bind:value={() => doubled, (v) => (items[0] = v)} />
</div>
