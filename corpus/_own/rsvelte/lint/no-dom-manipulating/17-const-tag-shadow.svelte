<script>
	let el;
	const rows = [1];
</script>

<div bind:this={el}>a</div>

{#each rows as row}
	{@const el = document.createElement('i')}
	<button onclick={() => el.remove()}>{row}</button>
{/each}
