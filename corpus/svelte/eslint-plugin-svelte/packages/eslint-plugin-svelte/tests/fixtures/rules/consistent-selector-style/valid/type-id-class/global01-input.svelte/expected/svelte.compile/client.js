import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="link">Click me!</a> <a>Click me two!</a> <b id="bold">Text 1</b> <b>Text 2</b> <b data-key="val">Text 2</b>`, 1);

export default function Global01_input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}