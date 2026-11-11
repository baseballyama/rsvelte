let s = $state(0);
export async function i(x) { s = x !== 1; }
export function g() { return s; }
