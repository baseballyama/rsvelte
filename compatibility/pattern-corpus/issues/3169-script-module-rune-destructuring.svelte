<script module>
	let source = { a: 1, b: 2, 'c-d': 3 };
	let seed = [1, 2];

	let { a, b = 5, 'c-d': cd, ...rest } = $state(source);
	let [first, second = 9] = $state.raw(seed);
	let { a: da, ...drest } = $derived({ ...source, a });
	let { b: db } = $derived(source);
	let [dfirst] = $derived.by(() => seed);

	export function read() {
		return [a, b, cd, rest, first, second, da, drest, db, dfirst];
	}
</script>

<p>{read().length}</p>
