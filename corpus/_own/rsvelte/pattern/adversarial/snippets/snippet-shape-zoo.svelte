<script>
	let { row, fallback } = $props();
	const items = [1, 2, 3];
	let depth = $state(2);
</script>

{#snippet plain()}
	<i>plain</i>
{/snippet}

{#snippet withArgs(a, b = 2, { c = 3 } = {}, [d = 4] = [])}
	<span>{a}/{b}/{c}/{d}</span>
{/snippet}

{#snippet recursive(n)}
	{#if n > 0}
		<ul><li>{n}{@render recursive(n - 1)}</li></ul>
	{/if}
{/snippet}

{#snippet shadowing(items)}
	{#each items as items}
		<b>{items}</b>
	{/each}
{/snippet}

{@render plain()}
{@render withArgs(1)}
{@render withArgs(1, 2, { c: 9 }, [8])}
{@render recursive(depth)}
{@render shadowing(items)}
{@render (row ?? plain)()}
{@render (row || fallback || plain)(items)}

{#each items as item}
	{@render withArgs(item, item * 2)}
{/each}
