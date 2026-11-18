export function f(o) {
	const { allItems } = $derived.by(() => { return o; });
	console.log(allItems);
}
