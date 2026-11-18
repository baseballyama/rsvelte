let count = $state(0);
const double = $derived.by(() => count * 2);

export function readDouble(): number {
	return double;
}
