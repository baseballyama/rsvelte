<script>
	let st = { a: 1, t: 'x' };
	let opts = ['x', 'y'];
	let tick = 0;
	$: if (tick) { st.a++; }
</script>
<select bind:value={st.t}>{#each opts as o}<option value={o}>{o}</option>{/each}</select>
<button on:click={() => {}}>go</button>