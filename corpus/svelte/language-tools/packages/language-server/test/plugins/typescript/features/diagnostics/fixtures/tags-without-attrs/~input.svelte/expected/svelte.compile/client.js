import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <svg></svg>`, 1);

export default function Input($$anchor) {
	var fragment = root();

	$.head('1ug1k0p', ($$anchor) => {});
	$.next(2);
	$.append($$anchor, fragment);
}