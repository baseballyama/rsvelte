<script>
	export let p = { a: 1, t: 'x' };
	let opts = ['x', 'y'];
	function go() { p.a = 2; }
</script>
<select bind:value={p.t}>{#each opts as o}<option value={o}>{o}</option>{/each}</select>
<button on:click={() => {}}>go</button>