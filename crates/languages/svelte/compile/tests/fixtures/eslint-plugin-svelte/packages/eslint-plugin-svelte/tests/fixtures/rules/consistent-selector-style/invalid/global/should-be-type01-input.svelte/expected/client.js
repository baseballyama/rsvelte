import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link">Click me!</a> <a class="link">Click me two!</a> <b class="bold">Text 1</b> <b class="bold" data-key="val">Text 2</b> <i id="italic">Italic</i>`, 1);

export default function Should_be_type01_input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}