<script>
	/* eslint svelte/shorthand-directive: ["warn", { "prefer": "never" }] */
	let color = 'red';
	let value = 'v';
	let active = true;
</script>

<div style:color|important>shorthand with modifier</div>
<input bind:value={value} />
<div class:active>shorthand class</div>
<div style:color={color}>longform style</div>
