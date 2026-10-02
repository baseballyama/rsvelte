import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Class_test_input($$anchor) {
	let a;
	let b;
	var div = root();
	let classes;

	$.template_effect(() => classes = $.set_class(div, 1, 'foo', null, classes, { a, b }));
	$.append($$anchor, div);
}