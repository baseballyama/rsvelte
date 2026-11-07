import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-17smh6p">Click me!</a> <a>Click me two!</a> <b class="bold svelte-17smh6p">Text 1</b> <b data-key="val">Text 3</b> <i class="svelte-17smh6p">Italic</i>`, 1);

export default function Should_be_id01_input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}