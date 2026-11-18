<script>
	let many = $state(['a']);
	let opts = $state(['a', 'b', 'c']);
</script>

<select multiple bind:value={many}>
	{#each opts as o}
		<option value={o} disabled={o === 'c'}>{o.toUpperCase()}</option>
	{/each}
	<option value="">empty</option>
</select>
<p>{many.join('|')}</p>
