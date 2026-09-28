import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <button id="setString"></button> <button id="setNull"></button> <button id="setUndefined"></button>`, 1);

export default function Main($$anchor) {
	let value = $.state(void 0);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.template_effect(() => $.set_value(input, $.get(value)));

	$.delegated('click', button, () => {
		$.set(value, "foo");
	});

	$.delegated('click', button_1, () => {
		$.set(value, null);
	});

	$.delegated('click', button_2, () => {
		$.set(value, undefined);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);