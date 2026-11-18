const state = $state(0);
const value = $derived(await load());
console.log(state);