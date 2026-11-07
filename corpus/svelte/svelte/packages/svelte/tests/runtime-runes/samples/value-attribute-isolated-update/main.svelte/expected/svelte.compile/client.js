import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <textarea></textarea> <input type="checkbox"/> <button> </button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let value = "";
	let checked = false;
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);
	$.set_value(input, value);

	var textarea = $.sibling(input, 2);

	$.remove_textarea_child(textarea);
	$.set_value(textarea, value);

	var input_1 = $.sibling(textarea, 2);

	$.remove_input_defaults(input_1);
	$.set_checked(input_1, checked);

	var button = $.sibling(input_1, 2);
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);