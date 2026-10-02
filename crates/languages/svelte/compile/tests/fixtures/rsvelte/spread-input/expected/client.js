import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

var root = $.from_html(`<input/> <input/> <input/> <input/> <p> </p>`, 1);

export default function Spread_input($$anchor, $$props) {
	let attrs = $.rest_props($$props, rest_excludes);
	let text = $.state('');
	let checked = $.state(false);
	var fragment = root();
	var input = $.first_child(fragment);
	$.attribute_effect(input, () => ({ ...attrs }), void 0, void 0, void 0, void 0, true);
	var input_1 = $.sibling(input, 2);
	$.attribute_effect(input_1, () => ({ ...attrs }), void 0, void 0, void 0, void 0, true);
	var input_2 = $.sibling(input_1, 2);
	$.attribute_effect(input_2, () => ({ type: 'checkbox', ...attrs }), void 0, void 0, void 0, void 0, true);
	var input_3 = $.sibling(input_2, 2);
	$.attribute_effect(input_3, () => ({ ...attrs, value: $.get(text), defaultValue: 'seed' }));
	var p = $.sibling(input_3, 2);
	var text_1 = $.only_child(p);
	$.template_effect(() => $.set_text(text_1, `${$.get(text) ?? ''} ${$.get(checked) ?? ''}`));
	$.bind_value(input_1, () => $.get(text), ($$value) => $.set(text, $$value));
	$.bind_checked(input_2, () => $.get(checked), ($$value) => $.set(checked, $$value));
	$.append($$anchor, fragment);
}
