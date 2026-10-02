import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	class Test {
		#deps = () => [];

		#_deps = $.derived(() => {
			return [];
		});

		get deps() {
			return $.get(this.#_deps);
		}

		set deps(value) {
			$.set(this.#_deps, value);
		}

		constructor(f = () => []) {
			this.#deps = f;
		}
	}

	$.pop();
}