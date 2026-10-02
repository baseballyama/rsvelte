import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label>Name <input/></label> <p> </p>`, 1);

export default function Attach_input($$anchor) {
	let text = $.state('');
	let focused = $.state(false);
	function autofocus(node) {
		node.focus();
	}
	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.sibling($.child(label));
	$.remove_input_defaults(input);
	$.attach(input, () => autofocus);
	$.reset(label);
	var p = $.sibling(label, 2);
	var text_1 = $.only_child(p, true);
	$.attach(p, () => () => {
		$.set(focused, $.get(text).length > 0);
	});
	$.template_effect(() => $.set_text(text_1, $.get(focused) ? 'typing' : 'idle'));
	$.bind_value(input, () => $.get(text), ($$value) => $.set(text, $$value));
	$.append($$anchor, fragment);
}
