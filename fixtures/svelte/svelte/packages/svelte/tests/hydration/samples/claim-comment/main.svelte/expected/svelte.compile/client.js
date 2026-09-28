import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var text = $.sibling($.first_child(fragment));

	text.nodeValue = ' p ';
	$.next();
	$.append($$anchor, fragment);
}