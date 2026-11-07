import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text" placeholder="Search" class="svelte-2dcw36"/>`);

export default function AdminSearch($$anchor, $$props) {
	$.push($$props, true);

	let text = $.prop($$props, 'text', 15, '');
	var input = root();

	$.remove_input_defaults(input);
	$.bind_value(input, text);
	$.append($$anchor, input);
	$.pop();
}