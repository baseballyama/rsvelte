import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	function assertThisLine() {}

	$.next();

	var text = $.text();

	text.nodeValue = foo.bar.baz;
	$.append($$anchor, text);
}