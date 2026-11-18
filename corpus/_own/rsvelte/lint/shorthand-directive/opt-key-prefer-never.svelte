<script>
	/* eslint svelte/shorthand-directive: ["warn", { "prefer": "never" }] */
	let value = 'v';
	let checked = false;
	let group = [];
	let active = true;
	let color = 'red';
</script>

<input bind:value />
<input type="checkbox" bind:checked />
<input type="checkbox" bind:group />
<div class:active>a</div>
<div style:color>b</div>
