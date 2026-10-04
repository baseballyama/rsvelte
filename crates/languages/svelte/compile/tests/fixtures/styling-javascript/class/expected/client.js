import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Class($$anchor, $$props) {
	$.push($$props, true);
	class Value {
		#value = "a";
		get value() {
			return this.#value;
		}
		set value(next) {
			this.#value = next;
		}
	}
	const value = new Value();
	var p = root();
	$.template_effect(() => $.set_class(p, 1, $.clsx(value.value), 'svelte-eso81h'));
	$.append($$anchor, p);
	$.pop();
}
