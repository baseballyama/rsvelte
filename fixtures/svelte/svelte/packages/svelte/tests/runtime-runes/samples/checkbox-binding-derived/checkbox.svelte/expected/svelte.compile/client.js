import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<label><input type="checkbox"/></label>`);

export default function Checkbox($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15);
	var label = root();
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.reset(label);
	$.bind_checked(input, value);
	$.append($$anchor, label);
	$.pop();
}