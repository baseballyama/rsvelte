const pattern = /$state(x)/;
const ratio = 8 / 2;
export function make() {
	let n = $state(ratio);
	const flag = $derived(n > 1);
	return { read: () => flag, bump: () => n++ };
}
