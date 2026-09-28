import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

document;

var root = $.from_html(` <p>You shouldn't see this</p>`, 1);

export default function _page($$anchor) {
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `${document ?? ''} `;
	$.next();
	$.append($$anchor, fragment);
}