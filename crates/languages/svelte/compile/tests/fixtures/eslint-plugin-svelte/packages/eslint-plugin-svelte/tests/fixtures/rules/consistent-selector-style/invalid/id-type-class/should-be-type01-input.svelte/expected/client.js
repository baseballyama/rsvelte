import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-5ez9c">Click me!</a> <a class="link svelte-5ez9c">Click me two!</a> <b class="bold svelte-5ez9c">Text 1</b> <b class="bold svelte-5ez9c" data-key="val">Text 2</b>`, 1);

export default function Should_be_type01_input($$anchor) {
	var fragment = root();

	$.next(6);
	$.append($$anchor, fragment);
}