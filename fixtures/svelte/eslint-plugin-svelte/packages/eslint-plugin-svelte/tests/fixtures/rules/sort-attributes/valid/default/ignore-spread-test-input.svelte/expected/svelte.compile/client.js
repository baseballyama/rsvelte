import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div>`, 1);

export default function Ignore_spread_test_input($$anchor) {
	let a;
	let b;
	let attrs;
	var fragment = root();
	var div = $.first_child(fragment);

	$.attribute_effect(div, () => ({ id: 'foo', ...attrs, class: 'foo' }));

	var div_1 = $.sibling(div, 2);

	$.attribute_effect(div_1, () => ({ ...attrs, id: 'foo', class: 'foo' }));

	var div_2 = $.sibling(div_1, 2);

	$.attribute_effect(div_2, () => ({ id: 'foo', class: 'foo', ...attrs }));
	$.append($$anchor, fragment);
}