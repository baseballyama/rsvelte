import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Hello World</button> <button type="">Hello World</button> <button type="">Hello World</button> <button type="foo">Hello World</button>`, 1);

export default function Test01_input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}