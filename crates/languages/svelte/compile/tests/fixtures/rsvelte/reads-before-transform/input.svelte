<script>
	let { items } = $props();
</script>
{#if items}
	{@const a = b}
	{@const f = () => b}
	{@const b = items.length}
	<h1>hello {a} {f()}</h1>
{/if}
{#each items as { a, b = c, c, d = a, e = e }}
	{a}{b}{c}{d}{e}
{/each}
{#each items as [x, y = z, z = x]}
	{x}{y}{z}
{/each}
{#snippet s({ p = q, q }, r = q, t)}
	{p}{q}{r}{t}
{/snippet}
{@render s(items)}
