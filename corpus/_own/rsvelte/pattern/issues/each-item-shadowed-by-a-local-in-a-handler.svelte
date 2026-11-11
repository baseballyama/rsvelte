<script>
	export let rows = [];
	export let cols = [];
</script>

{#each rows as row}
	<button
		on:click={() => {
			let row = { n: 1 };
			row.n = 2;
			row = { n: 3 };
			row.n++;
		}}>{row.n}</button>
{/each}

{#each cols as col}
	<button
		on:click={() => {
			col.n = 2;
		}}>{col.n}</button>
{/each}
