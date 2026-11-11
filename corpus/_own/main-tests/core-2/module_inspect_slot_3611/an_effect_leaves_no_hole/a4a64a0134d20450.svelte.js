let a = $state(1);
let d = $derived(a * 2);
$effect.pre(() => a);
export const z = 1;
export function use() { return a + d; }
