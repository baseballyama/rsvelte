export function f(o) {
	const { allItems } = $derived.by(() => o);
	console.log(allItems);
}
