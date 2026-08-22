<script>
	/* eslint svelte/prefer-const: ["warn", { "destructuring": "all" }] */
	const src = { p: 1, q: 2, r: 3, s: 4 };
	let { p, q } = src;
	p = 9;
	let { r, s } = src;
	void [p, q, r, s];
</script>
<p>destructuring all</p>
