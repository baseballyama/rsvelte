<script>
	let st = { a: 1, t: 'x' };
	let opts = ['x', 'y'];
	function go() { st.a++; }
</script>
<select bind:value={st.t}>{#each opts as o}<option value={o}>{o}</option>{/each}</select>
<button on:click={() => {}}>go</button>