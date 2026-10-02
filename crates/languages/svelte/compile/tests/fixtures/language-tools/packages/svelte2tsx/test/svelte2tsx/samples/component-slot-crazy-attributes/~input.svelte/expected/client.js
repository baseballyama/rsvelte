import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Input($$anchor, $$props) {
	let b = 7;
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', { a: b, b, c: 'b', d: 'a7', e: b }, ($$anchor) => {
		var text = $.text('Hello');

		$.append($$anchor, text);
	});

	$.reset(div);
	$.append($$anchor, div);
}