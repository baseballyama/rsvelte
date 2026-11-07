import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p> <p></p> <p> </p>`, 1);

export default function Unknown_values01_input($$anchor) {
	const numValue = 42;
	const strValue = 'string';
	let anyValue;
	var fragment = root();
	var p = $.first_child(fragment);

	p.textContent = '42';

	var p_1 = $.sibling(p, 2);

	p_1.textContent = 'string';

	var p_2 = $.sibling(p_1, 2);
	var text = $.only_child(p_2, true);

	$.template_effect(() => $.set_text(text, anyValue));
	$.append($$anchor, fragment);
}