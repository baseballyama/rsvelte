<script module>
	let o = $state({ a: 0, b: 0 });
	
	export function go() { o.a = o.b = () => {}; }
</script>
{1}
