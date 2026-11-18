let a = $state(1);
let d = $derived(a * 2);
export const tr = $effect.tracking();
export const pe = $effect.pending();
export const z = 1;
export function use() { return a + d; }
