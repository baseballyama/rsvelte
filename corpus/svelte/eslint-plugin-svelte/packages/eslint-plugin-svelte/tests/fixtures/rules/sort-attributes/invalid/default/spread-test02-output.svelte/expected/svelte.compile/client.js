import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Spread_test02_output($$anchor) {
	let attrs;
	var div = root();

	$.attribute_effect(div, () => ({ b: true, c: true, ...attrs, id: true, a: true }));
	$.append($$anchor, div);
}