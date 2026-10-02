import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);

var root_1 = $.from_html(`<select multiple=""></select> <p> </p>`, 1);

export default function Select_multiple($$anchor) {
	let flavours = $.state($.proxy(['mint']));
	const all = ['mint', 'lemon', 'cherry'];
	var fragment = root_1();
	var select = $.first_child(fragment);
	$.each(select, 21, () => all, $.index, ($$anchor, flavour) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};
		$.template_effect(() => {
			$.set_text(text, $.get(flavour));
			if (option_value !== (option_value = $.get(flavour))) {
				option.value = (option.__value = option_value) ?? '';
			}
		});
		$.append($$anchor, option);
	});
	$.reset(select);
	$.init_select(select);
	var p = $.sibling(select, 2);
	var text_1 = $.only_child(p, true);
	$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(flavours).join(', ')]);
	$.bind_select_value(select, () => $.get(flavours), ($$value) => $.set(flavours, $$value));
	$.append($$anchor, fragment);
}
