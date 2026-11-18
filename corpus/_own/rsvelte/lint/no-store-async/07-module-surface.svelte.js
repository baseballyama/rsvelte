import { writable as w, derived } from 'svelte/store';

export const counter = w(0, async (set) => {
	set(1);
});

export const doubled = derived(counter, ($counter) => $counter * 2);

export function decoy() {
	return 'w(0, async () => {})';
}
