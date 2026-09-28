import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		properties = $.rest_props($$props, rest_excludes);

	var input = root();

	$.attribute_effect(input, () => ({ ...properties }), void 0, void 0, void 0, void 0, true);
	$.bind_value(input, value);
	$.append($$anchor, input);
	$.pop();
}