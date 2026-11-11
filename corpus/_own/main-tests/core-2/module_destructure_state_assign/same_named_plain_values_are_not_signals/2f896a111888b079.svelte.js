let a = $state(0);
export function f() { a = 1; return a; }
export function g(o) { let a = $state.snapshot(o); a = 5; return a; }
