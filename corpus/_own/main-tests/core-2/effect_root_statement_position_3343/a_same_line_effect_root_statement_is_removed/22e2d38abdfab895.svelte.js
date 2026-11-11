let base = $state(1);
export function go() { function inner() { let mark = 1; $effect.root(() => { console.log(base); }); return mark; } return inner; }
