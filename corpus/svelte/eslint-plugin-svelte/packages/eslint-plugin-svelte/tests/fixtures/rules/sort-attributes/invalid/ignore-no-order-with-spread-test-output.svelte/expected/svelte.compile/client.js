import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div>`, 1);

export default function Ignore_no_order_with_spread_test_output($$anchor) {
	let attrs;
	var fragment = root();
	var div = $.first_child(fragment);

	$.attribute_effect(div, () => ({ 'order-b': true, ...attrs, 'order-a': true, 'order-c': true }));

	var div_1 = $.sibling(div, 2);

	$.attribute_effect(div_1, () => ({ a: true, b: true, ...attrs, c: true }));

	var div_2 = $.sibling(div_1, 2);

	$.attribute_effect(div_2, () => ({ c: true, ...attrs, b: true, a: true }));

	var div_3 = $.sibling(div_2, 2);

	$.attribute_effect(div_3, () => ({
		h: true,
		g: true,
		f: true,
		e: true,
		'order-b': true,
		d: true,
		...attrs,
		c: true,
		'order-a': true,
		'order-c': true,
		b: true,
		a: true
	}));

	$.append($$anchor, fragment);
}