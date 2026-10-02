import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> <p> </p>`, 1);

export default function Bind_value($$anchor) {
	let name = $.state('world');
	var fragment = root();
	var input = $.first_child(fragment);
	$.remove_input_defaults(input);
	var p = $.sibling(input, 2);
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `Hello ${$.get(name) ?? ''}!`));
	$.bind_value(input, () => $.get(name), ($$value) => $.set(name, $$value));
	$.append($$anchor, fragment);
}
