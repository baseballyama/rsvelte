import imported from './i.js';
let c = $state(0); let d = $derived.by(() => c + 1); console.log(d);
