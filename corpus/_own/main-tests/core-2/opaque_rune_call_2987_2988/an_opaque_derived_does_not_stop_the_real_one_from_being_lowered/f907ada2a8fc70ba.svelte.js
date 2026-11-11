let a = 1;
let b = 2;
/* $derived( */
export function make() {
	const flag = $derived(a !== b);
	return { read: () => flag };
}
