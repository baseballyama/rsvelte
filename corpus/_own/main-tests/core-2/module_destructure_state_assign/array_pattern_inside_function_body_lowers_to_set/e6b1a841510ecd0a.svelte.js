let count = $state(0);
let obj = $state({ a: 1 });
export function arr(a) { [count, obj] = a; }
