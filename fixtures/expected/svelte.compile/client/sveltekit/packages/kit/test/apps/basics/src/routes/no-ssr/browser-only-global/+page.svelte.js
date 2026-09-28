import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

document;

var root = $.from_html(` <p>Works</p>`, 1);

export default function _page($$anchor) {
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `${document ?? ''} `;
	$.next();
	$.append($$anchor, fragment);
}