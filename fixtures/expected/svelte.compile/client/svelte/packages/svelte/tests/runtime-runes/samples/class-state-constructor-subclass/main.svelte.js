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

		constructor(initial) {
			this.#count = $.state($.proxy(initial));
		}

		increment = () => {
			this.count++;
		};
	}

	class PluggableCounter extends Counter {
		#custom;

		get custom() {
			return $.get(this.#custom);
		}

		set custom(value) {
			$.set(this.#custom, value);
		}

		constructor(initial, plugin) {
			super(initial);
			this.#custom = $.derived(() => plugin(this.count));
		}
	}

	const counter = new PluggableCounter(10, (count) => count * 2);
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `${counter.count ?? ''}: ${counter.custom ?? ''}`));

	$.delegated('click', button, function (...$$args) {
		counter.increment?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);