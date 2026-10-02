import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-zna95z">Click me!</a> <a class="bold svelte-zna95z">Click me two!</a> <b class="bold svelte-zna95z">Text 1</b> <b class="link svelte-zna95z">Text 2</b> <b data-key="val">Text 3</b> <b>Text 4</b>`, 1);

export default function Class01_input($$anchor) {
	var fragment = root();
	var b = $.sibling($.first_child(fragment), 10);

	$.set_class(b, 1, 'svelte-zna95z', null, {}, { conditional: true });
	$.append($$anchor, fragment);
}