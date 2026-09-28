import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/>`);

export default function Main($$anchor, $$props) {
	var input = root();

	$.remove_input_defaults(input);
	$.template_effect(() => $.set_value(input, $$props.name));
	$.append($$anchor, input);
}