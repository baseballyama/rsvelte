import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link">Click me!</a> <a>Click me two!</a> <b class="bold">Text 1</b> <b data-key="val">Text 3</b>`, 1);

export default function Should_be_id01_input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}