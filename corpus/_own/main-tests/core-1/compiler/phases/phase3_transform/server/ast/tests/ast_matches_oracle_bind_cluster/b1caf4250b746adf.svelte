<script>
	let text = $state('text');
	let checkbox = $state(true);
	let radio_group = $state('a');
	let checkbox_group = $state(['a']);
	let select = $state('a');
	let textarea = $state('textarea');
</script>

<form>
	<input bind:value={text} />
	<input type="checkbox" bind:checked={checkbox} />
	<input type="radio" name="radio" value="a" bind:group={radio_group} />
	<input type="checkbox" name="checkbox" value="a" bind:group={checkbox_group} />
	<select bind:value={select}>
		<option value="a">a</option>
	</select>
	<textarea bind:value={textarea}></textarea>
</form>
