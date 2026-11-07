import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Index($$anchor) {
	const a = true;

	a === true;
	$.next();

	var text = $.text();

	text.nodeValue = 'true';
	$.append($$anchor, text);
}