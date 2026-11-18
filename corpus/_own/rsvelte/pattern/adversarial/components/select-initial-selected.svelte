<script>
	let v = $state('b');
	const items = ['a', 'b', 'c'];
</script>

<select bind:value={v}>
	{#each items as it}
		<option selected={it === 'a'} value={it}>{it}</option>
	{/each}
</select>
<select value="c">
	<option>a</option>
	<option value="c">c</option>
</select>
