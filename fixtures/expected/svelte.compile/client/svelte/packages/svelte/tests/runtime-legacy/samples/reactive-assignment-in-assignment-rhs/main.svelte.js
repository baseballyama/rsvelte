import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function Main($$anchor) {
	let foo;
	let bar;

	bar = foo = 1;

	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `${foo ?? ''} ${bar ?? ''}`));
	$.append($$anchor, h1);
}