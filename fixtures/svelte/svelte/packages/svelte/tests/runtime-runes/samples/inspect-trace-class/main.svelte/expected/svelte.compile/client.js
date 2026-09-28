import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count;

		constructor() {
			this.#count = $.state(0);
		}

		get count() {
			return $.get(this.#count);
		}

		increment = () => {
			$.set(this.#count, $.get(this.#count) + 1);
		};
	}

	const counter = new Counter();

	$.user_effect(() => {
		counter.count;
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${counter.count ?? ''}`));

	$.delegated('click', button, function (...$$args) {
		counter.increment?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);