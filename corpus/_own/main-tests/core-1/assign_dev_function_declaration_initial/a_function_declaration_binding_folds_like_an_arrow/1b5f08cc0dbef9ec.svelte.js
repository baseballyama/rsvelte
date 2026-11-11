let o = $state({ a: 0, b: 0 });
let h = () => {};
const g = h;
export function go() { o.a = o.b = g; }
