import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor) {
	let width = 0;
	let mobile = $.derived(() => width < 640);
	let x = $.derived(() => !$.get(mobile));

	$.next();

	var text = $.text();

	text.nodeValue = width / $.get(mobile) / $.get(x);
	$.append($$anchor, text);
}