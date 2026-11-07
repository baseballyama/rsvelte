import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div>`, 1);

export default function Class_test_input($$anchor) {
	let a;
	let b;
	var fragment = root();
	var div = $.first_child(fragment);
	let classes;
	var div_1 = $.sibling(div, 2);
	let classes_1;
	var div_2 = $.sibling(div_1, 2);
	let classes_2;

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'foo', null, classes, { a, b });
		classes_1 = $.set_class(div_1, 1, 'foo', null, classes_1, { b, a });
		classes_2 = $.set_class(div_2, 1, 'foo', null, classes_2, { a, b });
	});

	$.append($$anchor, fragment);
}