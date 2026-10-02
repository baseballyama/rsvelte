import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><span></span></div>`);

export default function Main($$anchor) {
	var div = root();
	var span = $.child(div);

	$.set_class(span, 1, 'a/42');
	$.reset(div);
	$.append($$anchor, div);
}