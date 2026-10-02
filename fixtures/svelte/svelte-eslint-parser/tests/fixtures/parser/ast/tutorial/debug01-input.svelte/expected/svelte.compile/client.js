import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <input/> <h1> </h1>`, 1);

export default function Debug01_input($$anchor) {
	let user = { firstname: 'Ada', lastname: 'Lovelace' };
	var fragment = root();

	$.template_effect(() => {
		console.log({ user: $.snapshot(user) });

		debugger;
	});

	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var h1 = $.sibling(input_1, 2);
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `Hello ${user.firstname ?? ''}!`));
	$.bind_value(input, () => user.firstname, ($$value) => user.firstname = $$value);
	$.bind_value(input_1, () => user.lastname, ($$value) => user.lastname = $$value);
	$.append($$anchor, fragment);
}