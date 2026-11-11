let a = $state(1);
const v /* $derived( */ = $derived(a + 9);

export function read() {
	return `${v}`;
}
