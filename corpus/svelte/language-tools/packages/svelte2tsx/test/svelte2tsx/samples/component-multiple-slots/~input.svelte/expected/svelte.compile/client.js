import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!> <!></div>`);

export default function Input($$anchor, $$props) {
	let b = 7;
	let d = 5;
	let e = 5;
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', { a: b }, ($$anchor) => {
		var text = $.text('Hello');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'test', { c: d, e }, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'abc-cde.113', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}