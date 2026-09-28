import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.next();

	var text = $.text();

	text.nodeValue = type instanceof Object;
	$.append($$anchor, text);
}