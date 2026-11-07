import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div></div> <!> <img/></div>`);

export default function Test01_output($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	CustomElement(node, {});
	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}