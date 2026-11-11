let a = 1;
let b = 2;
const label = `$derived(`;
export function make() {
	const flag = $derived(a !== b);
	return { read: () => flag };
}
