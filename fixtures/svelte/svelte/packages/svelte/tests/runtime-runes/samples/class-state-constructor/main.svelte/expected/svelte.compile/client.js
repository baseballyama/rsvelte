import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#doubled;

		get doubled() {
			return $.get(this.#doubled);
		}

		set doubled(value) {
			$.set(this.#doubled, value);
		}

		#count;

		constructor(initial) {
			this.#count = $.state($.proxy(initial));
			this.#doubled = $.derived(() => $.get(this.#count) * 2);
		}

		increment = () => {
			$.update(this.#count);
		};
	}

	const counter = new Counter(10);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, counter.doubled));

	$.delegated('click', button, function (...$$args) {
		counter.increment?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);