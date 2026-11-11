const t = `a ${`b ${"c"} d`} e`;
let n = $state(1);
export function bump() { n += 1; return [t, n]; }
