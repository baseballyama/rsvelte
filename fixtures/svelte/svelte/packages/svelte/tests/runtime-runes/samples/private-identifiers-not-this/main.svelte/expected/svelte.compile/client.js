import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <p> </p> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Box {
		#value = $.state(0);

		get value() {
			return $.get(this.#value);
		}

		constructor(num) {
			$.set(this.#value, num, true);
		}

		swap(other) {
			const value = $.get(this.#value);

			$.set(this.#value, other.value, true);
			$.set(other.#value, value, true);
		}
	}

	const a = new Box(42);
	const b = new Box(1337);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var button = $.sibling(p_1, 2);

	$.template_effect(() => {
		$.set_text(text, a.value);
		$.set_text(text_1, b.value);
	});

	$.delegated('click', button, () => {
		a.swap(b);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);