import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button>drop</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Counter {
		#count = $.state(1);

		bump(other) {
			$.update(other.#count);
		}

		drop(other) {
			$.update_pre(other.#count, -1);
		}

		getCount() {
			return $.get(this.#count);
		}
	}

	const a = new Counter();
	const b = new Counter();
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);

	$.template_effect(($0) => $.set_text(text, $0), [() => b.getCount()]);
	$.delegated('click', button, () => a.bump(b));
	$.delegated('click', button_1, () => a.drop(b));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);