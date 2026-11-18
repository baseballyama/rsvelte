let a = $state(1);
var v = $derived(a + 9);

export function read() {
	return `${v}`;
}
