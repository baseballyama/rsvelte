import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!></div>`);

export default function Input($$anchor, $$props) {
	let b = 7;
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', { a: b }, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'foo', { b }, null);
	$.reset(div);
	$.append($$anchor, div);
}