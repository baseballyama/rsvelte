<script>
	const optional = globalThis.location?.href;
	const direct = globalThis.location.href;
	const checked = globalThis.window instanceof Object ? globalThis.window.name : '';
	void [optional, direct, checked];
</script>
<p>globalThis paths</p>
