import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div></div>`);

export default function Child($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, () => ({ ...props }));
	$.append($$anchor, div);
}