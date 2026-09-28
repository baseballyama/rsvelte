import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/foo"></a> <a>bar</a>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);

	$.set_attribute(a, 'href', '#foo');
	$.append($$anchor, fragment);
}