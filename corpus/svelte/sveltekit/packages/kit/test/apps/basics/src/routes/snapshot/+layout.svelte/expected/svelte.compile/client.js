import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/snapshot/a">a</a> <a href="/snapshot/b">b</a> <a href="/snapshot/c" data-sveltekit-reload="">c</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 6);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}