import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <input/> <input/>`, 1);

export default function String01_input($$anchor) {
	let a = 'hello!';

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = 'hello! ';

	var input = $.sibling(text);

	$.set_class(input, 1, 'hello! a');

	var input_1 = $.sibling(input, 2);

	$.set_class(input_1, 1, '', null, {}, { foo: { a } });
	$.append($$anchor, fragment);
}