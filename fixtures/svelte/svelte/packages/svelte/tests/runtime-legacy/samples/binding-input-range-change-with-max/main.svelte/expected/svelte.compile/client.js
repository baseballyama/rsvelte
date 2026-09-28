import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <input type="range" min="0"/> <p> </p>`, 1);

export default function Main($$anchor) {
	let value = 10;
	let max = 10;

	function change() {
		value = 20;
		max = 20;
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var input = $.sibling(button, 2);

	$.remove_input_defaults(input);

	var p = $.sibling(input, 2);
	var text = $.only_child(p);

	$.template_effect(() => {
		$.set_attribute(input, 'max', max);
		$.set_text(text, `${value ?? ''} of ${max ?? ''}`);
	});

	$.event('click', button, change);
	$.bind_value(input, () => value, ($$value) => value = $$value);
	$.append($$anchor, fragment);
}