import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count;

		get count() {
			return $.get(this.#count);
		}

		set count(value) {
			$.set(this.#count, value, true);
		}

		constructor(count) {
			this.#count = $.state($.proxy(count));
		}
	}

	const counter = new Counter(0);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, counter.count));
	$.delegated('click', button, () => counter.count++);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);