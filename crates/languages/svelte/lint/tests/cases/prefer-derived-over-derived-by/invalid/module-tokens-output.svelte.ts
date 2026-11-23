let a = $state(1);
export const b = $derived(/* kept */ (a + 1));
export const c = $derived<number>((a, 2));
export const d = $derived.by(() => {
	return a, 3; // lost
});
