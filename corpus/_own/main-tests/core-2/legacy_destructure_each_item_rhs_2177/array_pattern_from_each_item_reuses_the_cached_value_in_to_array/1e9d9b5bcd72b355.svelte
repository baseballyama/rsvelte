<script>
	let list = [[1, 2], [3, 4]];
	let x, y;
</script>
{#each list as item}
	<button onclick={() => { [x, y] = item; }}>{item}</button>
{/each}
{x} {y}