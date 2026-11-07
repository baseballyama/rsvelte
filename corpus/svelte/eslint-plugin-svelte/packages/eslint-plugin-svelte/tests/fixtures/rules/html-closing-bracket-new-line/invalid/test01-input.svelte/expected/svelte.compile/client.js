import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div></div></div> <div></div> <div class="foo"></div>`, 1);

export default function Test01_input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}