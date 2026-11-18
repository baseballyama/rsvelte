export function s() {
	let a = $state(1);
	let b = $derived(a * 2);
	return () => b;
}
