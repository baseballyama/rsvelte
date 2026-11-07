import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a class="link svelte-18pnlon">Click me!</a> <span class="link svelte-18pnlon">Click me two!</span> <b class="bold svelte-18pnlon">Text 1</b> <strong class="bold svelte-18pnlon">Text 2</strong> <b data-key="val">Text 2</b> <b>Text 3</b>`, 1);

export default function Class01_input($$anchor) {
	var fragment = root();
	var b = $.sibling($.first_child(fragment), 10);

	$.set_class(b, 1, 'svelte-18pnlon', null, {}, { conditional: true });
	$.append($$anchor, fragment);
}