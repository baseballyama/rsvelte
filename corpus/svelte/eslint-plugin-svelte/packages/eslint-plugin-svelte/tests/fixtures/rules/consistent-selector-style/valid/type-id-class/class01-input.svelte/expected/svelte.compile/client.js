import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-1mhiyzt">Click me!</a> <a class="link svelte-1mhiyzt">Click me two!</a> <a>Click me three!</a> <b class="bold svelte-1mhiyzt">Text 1</b> <b class="bold svelte-1mhiyzt">Text 2</b> <b data-key="val">Text 3</b> <b>Text 4</b> <b class="conditional-two svelte-1mhiyzt">Text 5</b> <b>Text 6</b>`, 1);

export default function Class01_input($$anchor) {
	var fragment = root();
	var b = $.sibling($.first_child(fragment), 12);

	$.set_class(b, 1, 'svelte-1mhiyzt', null, {}, { conditional: true });

	var b_1 = $.sibling(b, 4);

	$.set_class(b_1, 1, 'svelte-1mhiyzt', null, {}, { 'conditional-two': true });
	$.append($$anchor, fragment);
}