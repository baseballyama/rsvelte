<script>
	let picked = $state([]);
	let one = $state('a');
	let many = $state(['a']);
	let files = $state(null);
	let group = $state([]);
	const opts = ['a', 'b', 'c'];
</script>

{#each opts as opt}
	<label><input type="checkbox" bind:group={picked} value={opt} />{opt}</label>
	<label><input type="radio" bind:group={one} value={opt} />{opt}</label>
{/each}

<select bind:value={one}>
	{#each opts as opt}<option value={opt}>{opt}</option>{/each}
</select>

<select multiple bind:value={many}>
	{#each opts as opt}<option value={opt}>{opt}</option>{/each}
</select>

<input type="file" multiple bind:files />

{#each opts as opt, i}
	<input type="checkbox" bind:group={group[i]} value={opt} />
{/each}

<p>{picked.length}{one}{many.length}{files ? 1 : 0}{group.length}</p>
