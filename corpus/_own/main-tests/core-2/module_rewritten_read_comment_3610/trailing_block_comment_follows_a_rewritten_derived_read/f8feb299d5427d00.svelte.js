let a = $state(1);
const d = $derived(a + 1);
export function read() {
	return [a, d]; /* trailing */
}