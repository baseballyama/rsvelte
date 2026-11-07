import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-1pjjq4g">Click me!</a> <a class="link svelte-1pjjq4g">Click me two!</a> <b class="bold svelte-1pjjq4g">Text 1</b> <b class="bold svelte-1pjjq4g" data-key="val">Text 2</b> <i id="italic" class="svelte-1pjjq4g">Italic</i>`, 1);

export default function Should_be_type01_input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}