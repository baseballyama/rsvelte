<script module>
	/* eslint svelte/max-lines-per-block: ["warn", { "script": 1 }] */
	export const x = 1;
	export const y = 2;
</script>

<script>
	const a = x;
	const b = y;
</script>

{a}{b}
