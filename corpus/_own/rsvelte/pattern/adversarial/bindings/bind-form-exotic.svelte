<script>
	let open = $state(false);
	let picks = $state([]);
	let files = $state(null);
	let html = $state('<b>x</b>');
	let text = $state('');
	let indeterminate = $state(true);
</script>

<details bind:open>
	<summary>more</summary>
</details>

<select multiple bind:value={picks}>
	<option value={1}>one</option>
	<option value={{ id: 2 }}>two</option>
</select>

<input type="file" multiple bind:files />
<input type="checkbox" bind:indeterminate />
<div contenteditable="true" bind:innerHTML={html}></div>
<blockquote contenteditable bind:textContent={text}></blockquote>
<p>{open}{picks.length}{files?.length}{text}</p>
