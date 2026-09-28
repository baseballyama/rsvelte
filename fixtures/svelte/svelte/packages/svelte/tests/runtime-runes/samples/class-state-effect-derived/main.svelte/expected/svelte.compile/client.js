import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count = $.state(0);

		get count() {
			return $.get(this.#count);
		}

		set count(value) {
			$.set(this.#count, value, true);
		}

		constructor(initial) {
			$.user_pre_effect(() => {
				console.log(this.count);
			});

			this.count = initial;
		}
	}

	const counter = $.derived(() => new Counter(10));

	$.get(counter);

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(counter).count));
	$.delegated('click', button, () => $.get(counter).count++);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);