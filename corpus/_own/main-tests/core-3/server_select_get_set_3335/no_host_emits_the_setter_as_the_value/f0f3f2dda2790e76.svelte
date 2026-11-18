<script>
	let v = 1;
	let rest = {};
</script>
<input type="text" bind:value={() => v, (nv) => v = nv} />
