<script>
	export let options = { from: 0 };
	let selected = [false];
	let index = 0;
</script>

<input bind:value={options.from} />
<input type="checkbox" bind:checked={selected[index]} />
