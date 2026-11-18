let a = $state(1);
const v = /**/ $derived(a + 9);

export function read() {
	return `${v}`;
}
