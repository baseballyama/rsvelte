import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/>`);

export default function Bindable_input($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.prop($$props, 'selected', 15);
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, () => selected().value, ($$value) => selected(selected().value = $$value, true));
	$.append($$anchor, input);
	$.pop();
}