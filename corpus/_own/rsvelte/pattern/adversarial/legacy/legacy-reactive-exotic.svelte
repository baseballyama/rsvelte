<script>
	export let base = 1;
	let obj = { a: 0, b: 0 };
	let arr = [0, 0];
	let doubled, tripled;

	$: ({ a, b } = obj);
	$: [x, y = x] = arr;
	$: doubled = base * 2, tripled = base * 3;
	$: {
		obj.a = base;
		if (base > 10) {
			arr = [base, base];
		}
	}

	function local() {
		outer: for (const k of [1, 2]) {
			if (k > base) break outer;
		}
	}
</script>

<button onclick={local}>{a}{b}{x}{y}{doubled}{tripled}</button>
