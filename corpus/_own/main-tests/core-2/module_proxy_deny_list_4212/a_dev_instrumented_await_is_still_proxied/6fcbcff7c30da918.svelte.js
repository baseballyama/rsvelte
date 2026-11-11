let s = $state(0);
export async function i(x) { s = await x; }
export function g() { return s; }
