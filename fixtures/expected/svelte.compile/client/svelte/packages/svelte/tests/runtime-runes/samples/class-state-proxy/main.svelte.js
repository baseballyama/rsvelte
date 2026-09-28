import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count = $.state();

		get count() {
			return $.get(this.#count);
		}

		set count(value) {
			$.set(this.#count, value, true);
		}

		constructor(v) {
			this.count = v;
		}
	}

	const counter = new Counter({ count: 0 });
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, counter.count.count));
	$.event('click', button, () => counter.count.count++);
	$.append($$anchor, button);
	$.pop();
}