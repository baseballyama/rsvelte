import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Spread_test01_output($$anchor) {
	let attrs;
	var div = root();

	$.attribute_effect(div, () => ({ c: true, d: true, ...attrs, a: true, b: true }));
	$.append($$anchor, div);
}