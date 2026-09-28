import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Foo</h1> <div id="default"><!></div> <div id="other"><!></div>`, 1);

export default function Foo($$anchor, $$props) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	$.slot(node_1, $$props, 'other', {}, null);
	$.reset(div_1);
	$.append($$anchor, fragment);
}