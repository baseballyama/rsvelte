import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <p> </p> <p> </p>`, 1);

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
		#tripled = $.derived(() => this.count * this.by);

		constructor(by) {
			this.by = by;
		}

		get embiggened1() {
			const self = this;

			return $.get(self.#doubled);
		}

		get embiggened2() {
			return $.get(this.#tripled);
		}
	}

	const counter = new Counter(3);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var p = $.sibling(button, 2);
	var text_1 = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_2 = $.only_child(p_1);

	$.template_effect(() => {
		$.set_text(text, counter.count);
		$.set_text(text_1, `doubled: ${counter.embiggened1 ?? ''}`);
		$.set_text(text_2, `tripled: ${counter.embiggened2 ?? ''}`);
	});

	$.event('click', button, () => counter.count++);
	$.append($$anchor, fragment);
	$.pop();
}