<script>
	let outer = 1;
	function f() {
		let outer = 2;
		outer = 3;
		return outer;
	}
	const pairs = [
		[1, 2],
		[3, 4]
	];
	let acc = 0;
	for (let i = 0; i < 3; i += 1) {
		acc += i;
	}
	for (const [k, v] of pairs) {
		acc += k + v;
	}
	void [f, acc, outer];
</script>
<p>scopes</p>
