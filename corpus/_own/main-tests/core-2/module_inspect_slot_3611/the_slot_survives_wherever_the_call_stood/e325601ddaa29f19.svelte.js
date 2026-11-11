let a = $state(1);
let d = $derived(a * 2);
const c = a ? $inspect(a) : 0;
export const z = 1;
export function use() { return a + d; }
