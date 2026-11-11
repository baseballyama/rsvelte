let source = { a: 1, b: 2, 'c-d': 3 };
let seed = [1, 2];

// Object pattern carrying a default, a non-identifier key and a rest.
let { a, b = 5, 'c-d': cd, ...rest } = $state(source);
// Array pattern: the `$$array` helper plus one read per element.
let [first, second = 9] = $state.raw(seed);
// A computed `$derived` argument needs a `$$d` source of its own.
let { a: da, ...drest } = $derived({ ...source, a });
// A bare identifier argument reads its members straight off the binding.
let { b: db } = $derived(source);
// `$derived.by` hands its callback to `$.derived` unthunked.
let [dfirst] = $derived.by(() => seed);
// A second destructure has to keep every generated name distinct.
let { a: a2 } = $state(source);

export function read() {
	return [a, b, cd, rest, first, second, da, drest, db, dfirst, a2];
}
