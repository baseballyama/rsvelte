import { untrack } from 'svelte';

let registry = $state(new Map());

export function watch(key, fn) {
	return $effect.root(() => {
		$effect(() => {
			const value = registry.get(key);
			untrack(() => fn(value));
		});

		$effect.pre(() => {
			if (!$effect.tracking()) return;
			void registry.size;
		});
	});
}

export function put(key, value) {
	const next = new Map(registry);
	next.set(key, value);
	registry = next;
}

export function* entries() {
	for (const pair of registry) {
		yield pair;
	}
}

export async function drain() {
	const all = [...registry.values()];
	registry = new Map();
	return Promise.all(all);
}
