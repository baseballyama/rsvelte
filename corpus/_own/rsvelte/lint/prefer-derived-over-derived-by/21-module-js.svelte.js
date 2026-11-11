let count = $state(0);

export const plain = $derived.by(() => count + 1);
export const blocked = $derived.by(() => {
	return count * 2;
});
export const kept = $derived.by(function named() {
	return count;
});
export const skipped = $derived.by((seed) => seed + count);
