import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'checked']);
var root = $.from_html(`<input/>`);

export default function CheckBox($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 15),
		rest = $.rest_props($$props, rest_excludes);

	var input = root();

	$.attribute_effect(input, () => ({ type: 'checkbox', ...rest }), void 0, void 0, void 0, void 0, true);
	$.bind_checked(input, checked);
	$.append($$anchor, input);
	$.pop();
}