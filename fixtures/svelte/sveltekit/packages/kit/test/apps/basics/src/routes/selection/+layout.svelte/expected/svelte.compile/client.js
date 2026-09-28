import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<nav><a href="/selection/a">a</a> <a href="/selection/b">b</a></nav> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}