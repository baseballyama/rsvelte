let a = $state(1);
let d = $derived(a * 2);
const t = $inspect(a).with(console.log);
export function read_t() { return t; }
export const z = 1;
export function use() { return a + d; }
