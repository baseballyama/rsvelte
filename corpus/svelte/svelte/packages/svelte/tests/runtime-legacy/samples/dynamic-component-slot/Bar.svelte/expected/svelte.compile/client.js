import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Bar</h1> <!> <!>`, 1);

export default function Bar($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'other', {}, null);
	$.append($$anchor, fragment);
}