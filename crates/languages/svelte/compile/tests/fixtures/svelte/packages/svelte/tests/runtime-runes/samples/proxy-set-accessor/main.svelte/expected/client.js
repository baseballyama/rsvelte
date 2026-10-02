import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <p> </p>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let text = $.proxy({
		value: 'svelte',
		get uppercase() {
			return this.value.toUpperCase();
		},

		set uppercase(v) {
			this.value = v.toLowerCase();
		}
	});

	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var p = $.sibling(input, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => $.set_text(text_1, text.value));
	$.bind_value(input, () => text.uppercase, ($$value) => text.uppercase = $$value);
	$.append($$anchor, fragment);
	$.pop();
}