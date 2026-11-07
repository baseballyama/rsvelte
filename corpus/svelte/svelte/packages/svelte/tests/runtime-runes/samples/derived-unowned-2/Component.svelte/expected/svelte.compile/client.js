import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

class Store {
	#all = $.state($.proxy([1, 2, 3]));

	get all() {
		return $.get(this.#all);
	}

	set all(value) {
		$.set(this.#all, value, true);
	}

	#d1 = $.derived(() => this.all.filter((a) => a > 2));

	get d1() {
		return $.get(this.#d1);
	}

	set d1(value) {
		$.set(this.#d1, value);
	}

	update_value() {
		this.all = [1, 2, 3, 4, 5];
	}
}

export const s = new Store();

export default function Component($$anchor, $$props) {
	$.push($$props, true);
	$.pop();
}