let a = $state(1);
const /* $derived( */ v = $derived(a + 9);

export function read() {
	return `${v}`;
}
