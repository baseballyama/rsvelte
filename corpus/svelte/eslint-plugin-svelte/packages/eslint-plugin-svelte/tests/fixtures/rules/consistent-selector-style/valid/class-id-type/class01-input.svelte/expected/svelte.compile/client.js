import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-yiffn7">Click me!</a> <b class="bold svelte-yiffn7">Text 1</b> <b data-key="val">Text 2</b>`, 1);

export default function Class01_input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}