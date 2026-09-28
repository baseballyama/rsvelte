import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/params-prop/123">123</a> <a href="/params-prop/456">456</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
}