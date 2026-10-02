import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/> `, 1);

export default function Main($$anchor) {
	function f() {}

	var fragment = root();
	var input = $.first_child(fragment);
	var text = $.sibling(input, 1, true);

	text.nodeValue = f;
	$.delegated('change', input, f);
	$.append($$anchor, fragment);
}

$.delegate(['change']);