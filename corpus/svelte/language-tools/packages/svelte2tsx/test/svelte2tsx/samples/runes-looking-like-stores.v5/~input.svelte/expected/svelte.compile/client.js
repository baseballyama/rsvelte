import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	let state = 0;
	let derived = $.derived(() => state * 2);

	$.next();

	var text = $.text();

	text.nodeValue = `0 ${$.get(derived) ?? ''}`;
	$.append($$anchor, text);
}