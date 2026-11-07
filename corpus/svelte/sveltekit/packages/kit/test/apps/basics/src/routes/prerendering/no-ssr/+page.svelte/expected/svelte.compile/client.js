import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello world!</h1> <p></p>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);

	p.textContent = window.location.origin;
	$.append($$anchor, fragment);
}