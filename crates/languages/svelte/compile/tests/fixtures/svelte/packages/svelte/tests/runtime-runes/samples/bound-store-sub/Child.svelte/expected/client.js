import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><input type="number"/></p>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let form = $.prop($$props, 'form', 15);
	var p = root();
	var input = $.child(p);

	$.remove_input_defaults(input);
	$.reset(p);
	$.bind_value(input, () => form().count, ($$value) => form(form().count = $$value, true));
	$.append($$anchor, p);
	$.pop();
}