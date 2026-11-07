import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <p> </p>`, 1);

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

		#doubled = $.derived(() => this.count * 2);

		get doubled() {
			return $.get(this.#doubled);
		}

		set doubled(value) {
			$.set(this.#doubled, value);
		}
	}

	const counter = new Counter();
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var p = $.sibling(button, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => {
		$.set_text(text, counter.count);
		$.set_text(text_1, `doubled: ${counter.doubled ?? ''}`);
	});

	$.event('click', button, () => counter.count++);
	$.append($$anchor, fragment);
	$.pop();
}