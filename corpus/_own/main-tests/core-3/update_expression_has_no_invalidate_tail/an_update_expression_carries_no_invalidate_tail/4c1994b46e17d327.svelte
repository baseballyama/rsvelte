<script>
	export let p = { a: 1, t: 'x' };
	let opts = ['x', 'y'];
	let tick = 0;
	$: if (tick) { p.a = 2; }
</script>
<select bind:value={p.t}>{#each opts as o}<option value={o}>{o}</option>{/each}</select>
<button on:click={() => {}}>go</button>