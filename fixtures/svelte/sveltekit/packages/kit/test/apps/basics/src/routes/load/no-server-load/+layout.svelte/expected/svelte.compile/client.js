import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/load/no-server-load/a">a</a> <a href="/load/no-server-load/b">b</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}