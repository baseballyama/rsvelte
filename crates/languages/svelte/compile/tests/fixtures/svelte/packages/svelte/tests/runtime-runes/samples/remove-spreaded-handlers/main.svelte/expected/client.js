import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <input type="checkbox"/> <button></button>`, 1);

export default function Main($$anchor) {
	let checked = $.state(true);
	let count = $.state(0);

	const onclick = $.derived(() => $.get(checked)
		? () => {
			$.update(count);
		}
		: undefined);

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var input = $.sibling(p, 2);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.attribute_effect(button, () => ({ ...{ onclick: $.get(onclick) } }));
	$.template_effect(() => $.set_text(text, $.get(count)));
	$.bind_checked(input, () => $.get(checked), ($$value) => $.set(checked, $$value));
	$.append($$anchor, fragment);
}