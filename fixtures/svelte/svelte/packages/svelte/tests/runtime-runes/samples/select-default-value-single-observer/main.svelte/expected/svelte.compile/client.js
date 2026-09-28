import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option></select>`, 1);

export default function Main($$anchor) {
	let value = 'a';
	let bound = $.state('a');
	let spread = $.state('a');
	let props = { defaultValue: 'b' };
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'b';
	$.reset(select);

	(
		select.value = select.__value = value,
		$.select_option(select, value)
	);

	$.set_default_select_value(select, 'b');
	$.init_select(select);

	var select_1 = $.sibling(select, 2);
	var option_2 = $.child(select_1);

	option_2.value = option_2.__value = 'a';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'b';
	$.reset(select_1);
	$.set_default_select_value(select_1, 'b');
	$.init_select(select_1);

	var select_2 = $.sibling(select_1, 2);

	$.attribute_effect(select_2, () => ({ ...props }));

	var option_4 = $.child(select_2);

	option_4.value = option_4.__value = 'a';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'b';
	$.reset(select_2);
	$.bind_select_value(select_1, () => $.get(bound), ($$value) => $.set(bound, $$value));
	$.bind_select_value(select_2, () => $.get(spread), ($$value) => $.set(spread, $$value));
	$.append($$anchor, fragment);
}