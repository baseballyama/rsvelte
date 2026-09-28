import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count = $.state(0);

		constructor() {
			$.user_effect(() => {
				$.set(this.#count, 10);
			});
		}

		getCount() {
			return $.get(this.#count);
		}

		increment() {
			$.update(this.#count);
		}
	}

	const counter = new Counter();
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => counter.getCount()]);
	$.event('click', button, () => counter.increment());
	$.append($$anchor, button);
	$.pop();
}