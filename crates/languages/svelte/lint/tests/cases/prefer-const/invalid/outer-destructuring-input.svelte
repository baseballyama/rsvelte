<script>
	let outer;
	function f(p) {
		let a;
		({ a, p } = { a: 1, p: 2 });
		let b, c;
		[b, c] = [1, 2];
		let d;
		({ d, e: outer } = { d: 1, e: 2 });
		return [a, b, c, d];
	}
</script>
{f}{outer}