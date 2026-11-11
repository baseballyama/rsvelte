let a = $state(1);
let d = $derived(a * 2);
const b = 1 + $inspect(a);
export const z = 1;
export function use() { return a + d; }
