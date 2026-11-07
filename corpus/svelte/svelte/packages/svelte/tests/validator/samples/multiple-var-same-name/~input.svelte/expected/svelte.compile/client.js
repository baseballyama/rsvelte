import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var test = "";
	var test = 42;

	$.next();

	var text = $.text();

	text.nodeValue = '42';
	$.append($$anchor, text);
}