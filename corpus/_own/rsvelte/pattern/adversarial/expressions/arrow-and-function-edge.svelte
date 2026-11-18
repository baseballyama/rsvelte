<script>
	let n = $state(0);
	const mk = (x = (y) => y + 1) => x(n);
	const obj = () => ({ value: n });
	const curried = (a) => (b) => (c) => a + b + c;
	const asyncArrow = async (x) => (await Promise.resolve(x)) + 1;

	async function* gen() {
		yield* [1, 2];
		yield await Promise.resolve(3);
	}

	function* sync() {
		const got = yield 1;
		return got;
	}
</script>

<button onclick={() => (n = mk())}>{obj().value}</button>
<button onclick={async () => (n = await asyncArrow(n))}>{curried(1)(2)(3)}</button>
<p>{typeof gen}:{typeof sync}</p>
