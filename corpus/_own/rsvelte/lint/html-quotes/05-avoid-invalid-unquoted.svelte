<script>
	/* eslint svelte/html-quotes: ["warn", { "dynamic": { "avoidInvalidUnquotedInHTML": true } }] */
	let a = 1;
	let b = 'x';
</script>

<div data-a={a + 1}>space in expression text: must be quoted</div>
<div data-b={b}>no invalid chars: unquoted stays ok</div>
<div data-c="{a}">quoted but no invalid chars: flagged unquoted</div>
