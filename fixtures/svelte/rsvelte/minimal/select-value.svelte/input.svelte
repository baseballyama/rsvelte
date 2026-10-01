<script>
	let picked = $state(1);
	let label = $state('two');
	let fallback = 'b';
</script>

<select value={picked} onchange={(e) => (picked = +e.currentTarget.value)}>
	<option value={1}>one</option>
	<option value={picked + 1}>{label}</option>
	<option>{label}</option>
</select>
<select defaultValue={fallback}>
	<option value="a">a</option>
	<option value="b" selected>b</option>
</select>
<select>
	<option>static</option>
	<option disabled value="">none</option>
</select>
<button type="button" onclick={() => (label += '!')}>more</button>
