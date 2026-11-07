import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>foo</button> <button>foo</button>`, 1);

export default function Transform_test02_output($$anchor) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;
	var fragment = root();
	var button = $.first_child(fragment);

	$.set_class(button, 1, '', null, {}, { 'a-or-b': a || b, 'not-a-and-not-b': !(a || b) });

	var button_1 = $.sibling(button, 2);

	$.set_class(button_1, 1, '', null, {}, { 'c-and-d': !(c && d), 'not-c-and-d': c && d });
	$.append($$anchor, fragment);
}