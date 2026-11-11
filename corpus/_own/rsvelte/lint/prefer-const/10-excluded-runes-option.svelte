<script>
	/* eslint svelte/prefer-const: ["warn", { "excludedRunes": ["$state"] }] */
	let st = $state(0);
	let dv = $derived(st * 2);
	void [st, dv];
</script>
<p>custom excluded runes</p>
