let o = $state({ a: 0, b: 0 });
function h() {}
const g = h;
export function go() { o.a = o.b = g; }
