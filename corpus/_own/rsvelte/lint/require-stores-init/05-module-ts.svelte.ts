import { writable, derived, type Readable } from 'svelte/store';

export const s = writable<number>();
export const t: Readable<number> = derived(s, ($s) => $s + 1);
