import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Document_highlight($$anchor) {
	let prop = 1;

	if (prop) {}

	$.next();

	var text = $.text();

	text.nodeValue = '1';
	$.append($$anchor, text);
}