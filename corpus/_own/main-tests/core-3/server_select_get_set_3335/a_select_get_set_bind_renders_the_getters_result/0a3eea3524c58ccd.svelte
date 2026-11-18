<script>
	let v = 1;
	let rest = {};
</script>
<select multiple bind:value={() => v, (nv) => v = nv}><option>a</option></select>
