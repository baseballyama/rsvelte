import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Spread_test03_output($$anchor) {
	let attrs;
	let attrs2;
	var div = root();

	$.attribute_effect(div, () => ({
		e: true,
		f: true,
		...attrs,
		c: true,
		d: true,
		...attrs2,
		a: true,
		b: true
	}));

	$.append($$anchor, div);
}