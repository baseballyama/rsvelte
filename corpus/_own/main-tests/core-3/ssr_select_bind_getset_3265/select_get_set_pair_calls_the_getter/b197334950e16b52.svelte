<script>
	let v = $state('a');
</script>
<select bind:value={() => v, (nv) => (v = nv)}>
	<option value="a">a</option>
</select>
