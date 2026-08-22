<script>
	let pairs = $state([[1, 2, 3], [4, 5]]);
	let objs = $state([{ id: 1, meta: { tags: ['a'] } }, { id: 2 }]);
	let { config = {} } = $props();
	let { sizes: [small = 1, ...bigger] = [] } = $derived(config);
</script>

{#each pairs as [first = 0, second = first, ...rest], i ([first, i])}
	<p>{first},{second},{rest.length}</p>
{/each}

{#each objs as { id, meta: { tags: [firstTag = 'none'] } = {} } (id)}
	<p>{id}:{firstTag}</p>
{/each}

<p>{small}:{bigger.length}</p>
