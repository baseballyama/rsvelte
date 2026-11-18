import { noop } from 'svelte/internal';

export async function lazy() {
	return import('svelte/internal/server');
}

export const decoy = 'svelte/internal';
void noop;
