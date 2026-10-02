import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/>`);

export default function No_bind($$anchor) {
	let strange = void 0;
	var input = root();

	$.remove_input_defaults(input);
	$.set_value(input, strange);
	$.append($$anchor, input);
}