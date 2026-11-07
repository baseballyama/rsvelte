import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img src="foo" alt="Foo"/> <img src="foo" alt="Foo"/>`, 1);

export default function Html_comment_svelte4_input($$anchor) {
	var fragment = root();
	var img = $.sibling($.first_child(fragment), 2);

	$.autofocus(img, true);
	$.append($$anchor, fragment);
}