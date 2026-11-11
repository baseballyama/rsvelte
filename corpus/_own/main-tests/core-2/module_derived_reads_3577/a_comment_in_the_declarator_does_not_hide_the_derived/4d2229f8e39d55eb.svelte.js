let a = $state(1);
const // k
	 v = $derived(a + 9);

export function read() {
	return `${v}`;
}
