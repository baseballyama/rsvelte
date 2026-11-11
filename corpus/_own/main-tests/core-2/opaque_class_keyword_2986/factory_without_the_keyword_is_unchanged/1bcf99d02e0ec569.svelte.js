let a = 1;
let b = 2;
// nothing special
export function make() {
	const flag = $derived(a !== b);
	return { read: () => flag };
}
