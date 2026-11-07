import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <!>`, 1);

export default function Test01_input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	SelfClosing(node, { class: 'foo' });
	$.append($$anchor, fragment);
}