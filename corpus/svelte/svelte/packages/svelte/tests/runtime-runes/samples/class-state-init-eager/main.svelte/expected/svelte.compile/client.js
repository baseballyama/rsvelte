import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#_count = $.state(100);

		get count() {
			return $.get(this.#_count);
		}

		set count(value) {
			$.set(this.#_count, value, true);
		}

		#count;

		constructor(initial_count) {
			console.log(this.count);
			this.count = initial_count;
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