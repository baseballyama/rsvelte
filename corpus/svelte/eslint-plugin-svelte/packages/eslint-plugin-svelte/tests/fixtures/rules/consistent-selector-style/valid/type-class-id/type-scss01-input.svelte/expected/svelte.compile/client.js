import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="svelte-fdxc04">Click me!</a> <b class="svelte-fdxc04">Text 1</b>`, 1);

export default function Type_scss01_input($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}