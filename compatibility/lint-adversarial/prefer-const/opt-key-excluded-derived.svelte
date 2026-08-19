<script>
	/* eslint svelte/prefer-const: ["warn",{"excludedRunes":["$derived"]}] */
	let d = $derived(1);
	let s = $state(2);
	let plain = 3;
	void d; void s; void plain;
</script>

<div>{d}{s}</div>
