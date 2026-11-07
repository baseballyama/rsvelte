import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-1juj17v">Click me!</a> <a>Click me two!</a> <b class="bold svelte-1juj17v">Text 1</b> <b data-key="val">Text 3</b> <i class="svelte-1juj17v">Italic</i>`, 1);

export default function Should_be_id_combination01_input($$anchor) {
	var fragment = root();

	$.next(8);
	$.append($$anchor, fragment);
}