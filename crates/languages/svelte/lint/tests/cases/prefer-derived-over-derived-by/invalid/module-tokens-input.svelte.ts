let a = $state(1);
export const b = $derived.by(() => {
	return /* kept */ (a + 1);
});
export const c = $derived.by((): number => (a, 2));
export const d = $derived.by(() => {
	return a, 3; // lost
});
