<script>
	let choice = $state('b');
	let objChoice = $state(null);
	const objects = [{ id: 1 }, { id: 2 }];
</script>

<select bind:value={choice}>
	<option>a</option>
	<option value="b">bee</option>
	<option value={'c'} disabled={choice === 'b'}>cee</option>
	{#each ['d', 'e'] as v}
		<option value={v} selected={v === choice}>{v}</option>
	{/each}
	<optgroup label="grouped">
		<option value="f">eff</option>
	</optgroup>
</select>

<select bind:value={objChoice}>
	{#each objects as o (o.id)}
		<option value={o}>{o.id}</option>
	{/each}
</select>

<p>{choice}:{objChoice?.id}</p>
