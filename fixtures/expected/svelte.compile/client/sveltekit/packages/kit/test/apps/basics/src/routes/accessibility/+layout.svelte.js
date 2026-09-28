import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>focus me</button> <nav><a href="/accessibility/a">a</a> <a href="/accessibility/b">b</a> <a href="/accessibility/autofocus/a">autofocus/a</a> <a href="/accessibility/autofocus/b">autofocus/b</a></nav> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}