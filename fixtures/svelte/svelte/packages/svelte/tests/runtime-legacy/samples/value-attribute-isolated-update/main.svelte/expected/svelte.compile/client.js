import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <textarea></textarea> <input type="checkbox"/> <button> </button>`, 1);

export default function Main($$anchor) {
	let count = 0;
	let value = { value: "" };
	let checked = { value: false };
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var textarea = $.sibling(input, 2);

	$.remove_textarea_child(textarea);

	var input_1 = $.sibling(textarea, 2);

	$.remove_input_defaults(input_1);

	var button = $.sibling(input_1, 2);
	var text = $.only_child(button, true);

	$.template_effect(() => {
		$.set_value(input, value.value);
		$.set_value(textarea, value.value);
		$.set_checked(input_1, checked.value);
		$.set_text(text, count);
	});

	$.event('click', button, () => count++);
	$.append($$anchor, fragment);
}