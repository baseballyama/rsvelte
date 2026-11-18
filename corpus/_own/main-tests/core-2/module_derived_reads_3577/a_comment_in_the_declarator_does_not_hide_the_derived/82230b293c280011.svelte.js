let a = $state(1);
const v /* a */ /* b */ = $derived(a + 9);

export function read() {
	return `${v}`;
}
