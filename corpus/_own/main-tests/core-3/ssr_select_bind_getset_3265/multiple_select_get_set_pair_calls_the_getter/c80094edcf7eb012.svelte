<script>
	let v = $state('a');
</script>
<select multiple bind:value={() => v, (nv) => (v = nv)}>
	<option value="a">a</option>
</select>
