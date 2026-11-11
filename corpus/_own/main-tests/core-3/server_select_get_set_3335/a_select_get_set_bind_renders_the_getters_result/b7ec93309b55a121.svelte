<script>
	let v = 1;
	let rest = {};
</script>
<select bind:value={() => v, (nv) => v = nv}><option>a</option></select>
