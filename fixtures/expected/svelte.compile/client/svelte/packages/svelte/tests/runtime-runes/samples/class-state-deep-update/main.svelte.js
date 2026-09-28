import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#container = $.state($.proxy({ count: -1 }));

		get container() {
			return $.get(this.#container);
		}

		set container(value) {
			$.set(this.#container, value, true);
		}

		#private = $.state($.proxy({ count: -1 }));

		constructor(initial_count) {
			this.container.count = initial_count;
			this.#private.v.count = initial_count;
		}

		increment() {
			this.container.count += 1;
			$.get(this.#private).count += 1;
		}

		get private_count() {
			return $.get(this.#private).count;
		}
	}

	const counter = new Counter(0);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);

	$.template_effect(() => {
		$.set_text(text, `${counter.container.count ?? ''} / ${counter.private_count ?? ''}`);
		$.set_text(text_1, `${counter.container.count ?? ''} / ${counter.private_count ?? ''}`);
	});

	$.event('click', button, () => counter.container.count++);
	$.event('click', button_1, () => counter.increment());
	$.append($$anchor, fragment);
	$.pop();
}