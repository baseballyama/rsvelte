import * as $ from 'svelte/internal/server';

class Store {
	all = [1, 2, 3];
	#d1 = $.derived(() => this.all.filter((a) => a > 2));

	get d1() {
		return this.#d1();
	}

	set d1($$value) {
		return this.#d1($$value);
	}

	update_value() {
		this.all = [1, 2, 3, 4, 5];
	}
}

export const s = new Store();

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {});
}