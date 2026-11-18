/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
import * as ns from 'svelte/store';

export const cache = new Map<string, number>();
export const stamps = new Set<number>();

const alias = ns['writ' + 'able'];

export const count = alias();
export const doubled = ns['derived'](count, (c) => c);

export function touch(key: string): void {
	cache['s' + 'et'](key, 1);
	stamps.add(1);
	count.subscribe();
}
