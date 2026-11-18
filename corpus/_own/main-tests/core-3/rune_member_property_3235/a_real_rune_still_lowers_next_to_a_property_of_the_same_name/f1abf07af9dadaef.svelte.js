const o = { $state: (v) => v };
const ignored = o.$state(1);
let a = $state(2);
export function bump() { a += 1; }