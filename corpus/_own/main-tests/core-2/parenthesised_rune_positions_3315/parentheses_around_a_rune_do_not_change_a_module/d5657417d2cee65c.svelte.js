let base = $state(1);
export function go() { ($effect(() => { console.log(base); })); }
