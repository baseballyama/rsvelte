import { writable } from 'svelte/store';

export const store = writable(0);
store.subscribe(() => {});

export function attach(other: { subscribe(fn: (v: number) => void): () => void }) {
	other.subscribe(() => {});
}
