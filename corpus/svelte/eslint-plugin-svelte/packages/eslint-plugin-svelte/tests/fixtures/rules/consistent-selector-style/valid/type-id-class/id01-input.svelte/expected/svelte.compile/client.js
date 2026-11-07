import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="link" class="svelte-1r829jy">Click me!</a> <a>Click me too!</a> <b id="bold" class="svelte-1r829jy">Text 1</b> <b data-key="val">Text 2</b>`, 1);

export default function Id01_input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}