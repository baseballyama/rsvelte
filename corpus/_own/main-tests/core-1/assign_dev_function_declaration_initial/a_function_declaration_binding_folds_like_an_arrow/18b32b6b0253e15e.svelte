<script module>
	let o = $state({ a: 0, b: 0 });
	const g = {};
	export function go() { o.a = o.b = g; }
</script>
{1}
