let a = $state(1);
const w = 1, v = /* $derived( */ $derived(a + 9);

export function read() {
	return `${v}`;
}
