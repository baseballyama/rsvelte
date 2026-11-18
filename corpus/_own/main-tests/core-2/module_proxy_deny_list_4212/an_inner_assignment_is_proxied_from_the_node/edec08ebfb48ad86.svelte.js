let s = $state(0);
let inner = $state(0);
export function i() { s = (inner = 1); }
export function g() { return [s, inner]; }
