<script module>
	let o = $state({ a: 0, b: 0 });
	const g = 1;
	export function go() { o.a = o.b = g; }
</script>
{1}
