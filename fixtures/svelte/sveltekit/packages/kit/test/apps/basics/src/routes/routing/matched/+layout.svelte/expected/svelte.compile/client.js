import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/routing/matched/a">/routing/matched/a</a> <a href="/routing/matched/B">/routing/matched/B</a> <a href="/routing/matched/1">/routing/matched/1</a> <a href="/routing/matched/everything-else">/routing/matched/everything-else</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 8);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}