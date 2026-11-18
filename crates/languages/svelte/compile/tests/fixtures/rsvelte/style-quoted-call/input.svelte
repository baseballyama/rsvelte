<script>
	let { f, x, items } = $props();
	let n = $state(1);
</script>
<div style:left="{f(x) + n}px" style:top="{n}px" style:width={f(n)} style:color="red" style:transform="translate({f(1)}, {n})"></div>
<div {...items} style:left="{f(x)}px"></div>
<Comp --a="{f(n)}px" />
{#each items as item (item.key)}
	<span style:left="{f(item.x)}px">{item.k}</span>
{/each}
