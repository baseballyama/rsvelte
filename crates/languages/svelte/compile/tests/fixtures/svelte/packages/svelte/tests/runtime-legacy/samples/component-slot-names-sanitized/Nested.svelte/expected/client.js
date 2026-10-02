import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!> <!> <!> <!> <!></div>`);

export default function Nested($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'header1', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, '-header2_', {}, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, '3header', {}, null);

	var node_3 = $.sibling(node_2, 2);

	$.slot(node_3, $$props, '_header4', {}, null);

	var node_4 = $.sibling(node_3, 2);

	$.slot(node_4, $$props, 'header-5', {}, null);

	var node_5 = $.sibling(node_4, 2);

	$.slot(node_5, $$props, 'header&5', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}