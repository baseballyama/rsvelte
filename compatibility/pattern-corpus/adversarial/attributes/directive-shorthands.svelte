<script>
	let value = $state('');
	let checked = $state(false);
	let active = $state(true);
	let color = $state('red');
	let open = $state(false);
</script>

<input bind:value {checked} />
<input type="checkbox" bind:checked />
<details bind:open>
	<summary class:active style:color>short</summary>
</details>
<div class:active class:is-busy={!active} class:a-b-c={open}>d</div>
<p>{value}{color}</p>
