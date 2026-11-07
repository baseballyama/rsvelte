import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Spread_test01_input($$anchor) {
	let attrs;
	var div = root();

	$.attribute_effect(div, () => ({ d: true, c: true, ...attrs, b: true, a: true }));
	$.append($$anchor, div);
}