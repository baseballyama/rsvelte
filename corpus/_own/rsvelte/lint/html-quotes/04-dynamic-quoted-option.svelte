<script>
	/* eslint svelte/html-quotes: ["warn", { "dynamic": { "quoted": true } }] */
	let x = 1;
</script>

<div data-x={x}>unquoted dynamic now flagged</div>
<div data-y="{x}">ok now</div>
<div data-z='{x}'>wrong quote kind</div>
