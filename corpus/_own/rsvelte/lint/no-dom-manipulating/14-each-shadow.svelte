<script>
	let el;
	const rows = [1, 2];
</script>

<div bind:this={el}>a</div>

{#each rows as el}
	<button onclick={() => el.remove()}>shadowed</button>
{/each}

{#each rows as row}
	<button onclick={() => el.remove()}>{row}</button>
{/each}
