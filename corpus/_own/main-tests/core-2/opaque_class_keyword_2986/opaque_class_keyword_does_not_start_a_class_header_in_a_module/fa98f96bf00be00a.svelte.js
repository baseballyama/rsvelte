let a = 1;
let b = 2;
// we avoid class here
export function make() {
	const flag = $derived(a !== b);
	return { read: () => flag };
}
