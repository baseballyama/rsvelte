import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!> <!></div>`);

export default function Nested($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'bar', {}, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'foo', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}