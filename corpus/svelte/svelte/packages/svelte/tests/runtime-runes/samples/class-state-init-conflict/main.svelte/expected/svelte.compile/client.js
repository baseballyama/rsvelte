import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#__count = $.state(0);

		get count() {
			return $.get(this.#__count);
		}

		set count(value) {
			$.set(this.#__count, value, true);
		}

		#count;
		#_count;

		constructor(initial_count) {
			this.count = initial_count;
			this.#count = 100;
			this.#_count = 100;
		}
	}

	const counter = new Counter(0);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, counter.count));
	$.event('click', button, () => counter.count++);
	$.append($$anchor, button);
	$.pop();
}