let seeded = 0;

export class Registry {
	static #instances = 0;
	static registry = ['boot'];

	static {
		seeded = 1;
		Registry.registry.push('again');
	}

	#slot = $state(0);
	'quoted-key' = $state('qk');

	get slot() {
		return this.#slot;
	}

	set slot(v) {
		this.#slot = v;
	}

	static get count() {
		return Registry.#instances;
	}

	constructor() {
		Registry.#instances += 1;
	}

	#hidden() {
		return this.#slot * 2;
	}

	doubled = $derived(this.#hidden());
}

export function bootCount() {
	return seeded;
}
