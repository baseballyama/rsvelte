import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>a: <!></div> <div>b: <!></div>`, 1);

export default function Nested($$anchor, $$props) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div));

	$.slot(node, $$props, 'a', {}, null);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1));

	$.slot(node_1, $$props, 'b', {}, null);
	$.reset(div_1);
	$.append($$anchor, fragment);
}