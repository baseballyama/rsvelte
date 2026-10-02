import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <input type="number"/>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(0);
	const min = 2;
	const max = 5;

	$.user_effect(() => {
		setValue();
	});

	function setValue() {
		if ($.get(value) < min) {
			$.set(value, min);
		}

		if ($.get(value) > max) {
			$.set(value, max);
		}
	}

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var input = $.sibling(p, 2);

	$.remove_input_defaults(input);
	$.template_effect(() => $.set_text(text, $.get(value)));
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, fragment);
	$.pop();
}