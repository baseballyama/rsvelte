<script>
	/* eslint svelte/shorthand-attribute: ["warn", { "prefer": "never" }] */
	let title = 't';
	let id = 'i';
</script>

<div {title}>a</div>
<div id={id}>b</div>
<div {...{ title }}>c</div>
