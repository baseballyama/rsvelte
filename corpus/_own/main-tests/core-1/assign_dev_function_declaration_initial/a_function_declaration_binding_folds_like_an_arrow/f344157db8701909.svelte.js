let o = $state({ a: 0, b: 0 });
function h() {}
export function go() { o.a = o.b = h; }
