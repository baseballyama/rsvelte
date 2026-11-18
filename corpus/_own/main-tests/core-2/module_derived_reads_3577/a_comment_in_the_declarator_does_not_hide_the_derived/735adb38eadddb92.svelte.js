let a = $state(1);
const /* a */ /* b */ v = $derived(a + 9);

export function read() {
	return `${v}`;
}
