<script>
	/* eslint svelte/prefer-class-directive: ["warn", { "prefer": "always" }] */
	let ok = true;
</script>

<div class={ok ? 'a' : 'b'}>1</div>
<div class={ok ? 'a' : ''}>2</div>
