let a = $state(1);
let d = $derived(a * 2);
$inspect(a, a + 1);
export const z = 1;
export function use() { return a + d; }
