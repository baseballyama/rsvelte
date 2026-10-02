import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Tag_test01_input($$anchor) {
	$.next();

	var text = $.text();

	text.nodeValue = '<br>';
	$.append($$anchor, text);
}