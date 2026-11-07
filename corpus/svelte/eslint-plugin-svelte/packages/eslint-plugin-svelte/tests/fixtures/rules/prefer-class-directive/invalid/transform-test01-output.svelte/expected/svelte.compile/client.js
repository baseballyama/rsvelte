import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>foo</button> <button>foo</button> <button>foo</button>`, 1);

export default function Transform_test01_output($$anchor) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;
	var fragment = root();
	var button = $.first_child(fragment);

	$.set_class(button, 1, '', null, {}, { a, 'not-a': !a });

	var button_1 = $.sibling(button, 2);

	$.set_class(button_1, 1, '', null, {}, { 'no-b': !b, b });

	var button_2 = $.sibling(button_1, 2);

	$.set_class(button_2, 1, '', null, {}, { 'c-eq-d': c === d });

	var button_3 = $.sibling(button_2, 2);

	$.set_class(button_3, 1, '', null, {}, { 'c-not-eq-d': c !== d, 'c-eq-d': c === d });
	$.append($$anchor, fragment);
}