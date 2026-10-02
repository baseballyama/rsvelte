import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);

var root_1 = $.from_html(`<select><option>A</option><option>B</option><!></select> <p> </p>`, 1);

export default function Select_bind($$anchor) {
	let choice = $.state('b');
	let items = $.proxy(['a', 'b']);
	var fragment = root_1();
	var select = $.first_child(fragment);
	var option = $.child(select);
	option.value = option.__value = 'a';
	var option_1 = $.sibling(option);
	option_1.value = option_1.__value = 'b';
	var node = $.sibling(option_1);
	$.each(node, 17, () => items, $.index, ($$anchor, item) => {
		var option_2 = root();
		var text = $.only_child(option_2, true);
		var option_2_value = {};
		$.template_effect(() => {
			$.set_text(text, $.get(item));
			if (option_2_value !== (option_2_value = $.get(item))) {
				option_2.__value = option_2_value;
			}
		});
		$.append($$anchor, option_2);
	});
	$.reset(select);
	$.init_select(select);
	var p = $.sibling(select, 2);
	var text_1 = $.only_child(p, true);
	$.template_effect(() => $.set_text(text_1, $.get(choice)));
	$.bind_select_value(select, () => $.get(choice), ($$value) => $.set(choice, $$value));
	$.append($$anchor, fragment);
}
