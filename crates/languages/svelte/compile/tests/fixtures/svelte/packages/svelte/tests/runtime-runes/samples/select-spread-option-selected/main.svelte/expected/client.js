import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>o1</option><option selected="">o2</option></select>`);

export default function Main($$anchor) {
	let others = { onclick: () => {} };
	var select = root();

	$.attribute_effect(select, () => ({ ...others }));
	$.append($$anchor, select);
}