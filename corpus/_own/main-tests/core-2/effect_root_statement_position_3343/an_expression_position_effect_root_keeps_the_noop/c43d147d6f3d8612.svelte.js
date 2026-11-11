let base = $state(1);
export function go() { const stop = $effect.root(() => { console.log(base); }); return stop; }
