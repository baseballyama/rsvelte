<script module>
	let o = $state({ a: 0, b: 0 });
	class C {}
	const g = C;
	export function go() { o.a = o.b = g; }
</script>
{1}
