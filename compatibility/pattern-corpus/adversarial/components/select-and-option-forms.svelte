<script>
	let single = $state('b');
	let many = $state(['a']);
	const options = [
		{ v: 'a', l: 'A' },
		{ v: 'b', l: 'B' }
	];
	let grouped = $state('a');
</script>

<select bind:value={single}>
	{#each options as o (o.v)}
		<option value={o.v}>{o.l}</option>
	{/each}
</select>

<select multiple bind:value={many}>
	<option value="a" selected>A</option>
	<option value="b">B</option>
</select>

<select bind:value={grouped}>
	<optgroup label="g">
		<option value="a">A</option>
		{#if options.length > 1}
			<option value="b">B</option>
		{/if}
	</optgroup>
</select>

<select value={single} onchange={(e) => (single = e.currentTarget.value)}>
	<option>bare</option>
	<option value={undefined}>undef</option>
</select>

<p>{single} {many.join(',')} {grouped}</p>
