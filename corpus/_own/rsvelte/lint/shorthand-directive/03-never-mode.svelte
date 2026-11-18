<script>
	/* eslint svelte/shorthand-directive: ["warn", { "prefer": "never" }] */
	let value = 'v';
	let active = true;
	let color = 'red';
</script>

<input bind:value />
<div class:active>a</div>
<div style:color>b</div>
<input bind:value={value} />
<div class:active={active}>c</div>
