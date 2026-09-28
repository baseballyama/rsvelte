import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="value"/>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let a = $.prop($$props, 'a', 15);
	var input = root();

	$.remove_input_defaults(input);

	$.bind_value(input, () => a(), (v) => {
		console.log('b', v);
		a(v);
	});

	$.append($$anchor, input);
	$.pop();
}