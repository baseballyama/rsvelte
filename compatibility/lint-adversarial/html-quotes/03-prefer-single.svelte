<script>
	/* eslint svelte/html-quotes: ["warn", { "prefer": "single" }] */
	let x = 1;
</script>

<div title="double now flagged">a</div>
<div title='ok'>b</div>
<div title=unquoted>c</div>
<div data-x={x}>d</div>
