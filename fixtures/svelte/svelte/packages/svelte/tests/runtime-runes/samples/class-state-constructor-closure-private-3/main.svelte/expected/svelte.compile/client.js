import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const counter = new (class Counter {
		#count;

		get count() {
			return $.get(this.#count);
		}

		set count(value) {
			$.set(this.#count, value, true);
		}

		constructor() {
			this.#count = $.state(0);

			$.user_effect(() => {
				this.count = 10;
			});
		}
	})();

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, counter.count));
	$.event('click', button, () => counter.count++);
	$.append($$anchor, button);
	$.pop();
}