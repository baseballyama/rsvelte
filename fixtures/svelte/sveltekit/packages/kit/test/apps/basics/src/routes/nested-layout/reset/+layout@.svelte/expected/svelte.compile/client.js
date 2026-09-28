import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Layout reset</h1> <!>`, 1);

export default function _layout_($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}