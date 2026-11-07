import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="link" class="svelte-guwf96">Click me!</a> <b id="bold" class="svelte-guwf96">Text 1</b> <b data-key="val">Text 2</b>`, 1);

export default function Id01_input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}