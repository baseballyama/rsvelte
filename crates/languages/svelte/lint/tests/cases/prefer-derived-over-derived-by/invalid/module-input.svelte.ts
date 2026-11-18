let a = $state(1);
export const b = $derived.by(() => a + 1);
