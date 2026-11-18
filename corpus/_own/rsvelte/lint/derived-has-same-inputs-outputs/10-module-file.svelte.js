import { derived, writable } from 'svelte/store';

export const a = writable(1);
export const d = derived(a, (val) => val + 1);
