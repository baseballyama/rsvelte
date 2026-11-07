import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Test {
		#__;

		get '1'() {
			return $.get(this.#__);
		}

		set '1'(value) {
			$.set(this.#__, value, true);
		}

		#_ = $.state();

		get 0() {
			return $.get(this.#_);
		}

		set 0(value) {
			$.set(this.#_, value, true);
		}

		constructor() {
			this.#__ = $.state();
		}
	}

	$.pop();
}