let base = $state(1);
export function go() { return $effect.root(() => { console.log(base); }); }
