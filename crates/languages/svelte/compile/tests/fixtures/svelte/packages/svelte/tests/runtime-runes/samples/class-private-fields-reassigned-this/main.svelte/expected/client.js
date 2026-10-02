import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count = $.state();

		constructor() {
			const instance = this;

			$.set(instance.#count, 1);
		}

		get count() {
			return $.get(this.#count);
		}

		get count2() {
			const instance = this;

			return $.get(instance.#count);
		}
	}

	const counter = new Counter();

	;;
	;;
	$.pop();
}