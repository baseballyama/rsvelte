import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _1_input($$anchor) {
	$.next();

	var text = $.text();

	text.nodeValue = expression;
	$.append($$anchor, text);
}