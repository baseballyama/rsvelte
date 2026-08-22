<script>
	let els = $state([]);
	let registry = $state({ header: null, deep: { cell: null } });
	let items = $state(['a', 'b']);
</script>

<h1 bind:this={registry.header}>title</h1>
<td bind:this={registry.deep.cell}></td>

{#each items as it, i}
	<div bind:this={els[i]}>{it}</div>
{/each}
