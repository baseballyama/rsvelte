import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<button>Hello world</button>`);

export default function Button($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	var button = root();

	$.attribute_effect(button, () => ({ ...props }));
	$.append($$anchor, button);
}