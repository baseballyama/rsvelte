<script>
	export let rows;
	export let p;
	export let a;
</script>

{#each rows as row}
	{#if a}
		<p>{row}</p>
	{:else if a}
		<p>x</p>
	{/if}
{/each}

{#await p then value}
	{#if a}
		<p>{value}</p>
	{:else if a}
		<p>y</p>
	{/if}
{/await}

{#key a}
	{#if a}
		<p>1</p>
	{:else if a}
		<p>2</p>
	{/if}
{/key}
