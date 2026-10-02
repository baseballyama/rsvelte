import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-155xx9s">Click me!</a> <a class="link svelte-155xx9s">Click me two!</a> <a>Click me three!</a> <b class="bold svelte-155xx9s">Text 1</b> <b class="bold svelte-155xx9s">Text 2</b> <b data-key="val">Text 3</b> <b>Text 4</b>`, 1);

export default function Class01_input($$anchor) {
	var fragment = root();
	var b = $.sibling($.first_child(fragment), 12);

	$.set_class(b, 1, 'svelte-155xx9s', null, {}, { conditinal: true });
	$.append($$anchor, fragment);
}