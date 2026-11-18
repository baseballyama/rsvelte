let base = $state(1);
export function go() { let mark = 1; $effect.root(() => { console.log(base); }); return mark; }
