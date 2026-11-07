import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Spread_test03_input($$anchor) {
	let attrs;
	let attrs2;
	var div = root();

	$.attribute_effect(div, () => ({
		f: true,
		e: true,
		...attrs,
		d: true,
		c: true,
		...attrs2,
		b: true,
		a: true
	}));

	$.append($$anchor, div);
}