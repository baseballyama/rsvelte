import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/prerendering/env/prerendered">prerendered</a> <a href="/prerendering/env/dynamic">dynamic</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}