import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-1mengpy">Click me!</a> <b class="bold svelte-1mengpy">Text 1</b> <b>Text 2</b>`, 1);

export default function Class_scss01_input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}