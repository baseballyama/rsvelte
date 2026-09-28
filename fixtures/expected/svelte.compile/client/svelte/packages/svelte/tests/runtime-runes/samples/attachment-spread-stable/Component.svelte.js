import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<p>hello</p>`);

export default function Component($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	var p = root();

	$.attribute_effect(p, () => ({ ...props }));
	$.append($$anchor, p);
}