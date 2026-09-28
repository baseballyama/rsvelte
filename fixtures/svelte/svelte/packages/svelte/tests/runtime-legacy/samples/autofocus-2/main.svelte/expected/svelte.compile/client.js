import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>wat</h1> <input/>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var input = $.sibling($.first_child(fragment), 2);

	$.autofocus(input, true);
	$.append($$anchor, fragment);
}