<script>
	/* eslint svelte/prefer-const: ["warn", { "ignoreReadBeforeAssign": true }] */
	let timer;
	const peek = () => timer;
	timer = peek() ?? 1;
	let normal;
	normal = 2;
	void [timer, normal];
</script>
<p>read before assign</p>
