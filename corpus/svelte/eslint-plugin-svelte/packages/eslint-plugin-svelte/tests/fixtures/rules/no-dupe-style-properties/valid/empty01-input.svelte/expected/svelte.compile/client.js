import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div style="">...</div> <div style="">...</div>`, 1);

export default function Empty01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}