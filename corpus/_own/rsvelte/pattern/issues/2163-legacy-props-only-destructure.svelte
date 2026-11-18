<script>
	export let a = 1;
	export let b = 2;
	export let rest = {};
	export let pair = [3, 4];
	const obj = { a: 3, b: 4 };

	function f() {
		({ a, b } = obj);
	}

	function g() {
		({ a, ...rest } = obj);
	}

	function h() {
		[a, b] = pair;
	}
</script>

<button onclick={f}>{a}{b}</button>
<button onclick={g}>{Object.keys(rest).length}</button>
<button onclick={h}>{a}{b}</button>
