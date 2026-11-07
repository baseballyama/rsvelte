import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="link" class="svelte-1brcj9">Click me!</a> <b id="bold" class="svelte-1brcj9">Text 1</b> <b>Text 2</b>`, 1);

export default function Id_scss01_input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}