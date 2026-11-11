let a = $state(1);
const v = // k
	 $derived(a + 9);

export function read() {
	return `${v}`;
}
