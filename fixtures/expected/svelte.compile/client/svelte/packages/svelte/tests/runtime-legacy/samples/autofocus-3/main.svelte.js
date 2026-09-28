import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><input/></div>`);

export default function Main($$anchor) {
	var div = root();
	var input = $.child(div);

	$.autofocus(input, true);
	$.reset(div);
	$.append($$anchor, div);
}