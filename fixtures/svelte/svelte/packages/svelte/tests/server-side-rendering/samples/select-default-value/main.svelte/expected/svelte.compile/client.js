import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option></select> <select multiple=""><option>A</option><option>B</option><option>C</option></select> <select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option></select>`, 1);

export default function Main($$anchor) {
	const props = { defaultValue: 'b' };
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'b';
	$.reset(select);
	$.set_default_select_value(select, 'b');
	$.init_select(select);

	var select_1 = $.sibling(select, 2);

	$.attribute_effect(select_1, () => ({ ...props }));

	var option_2 = $.child(select_1);

	option_2.value = option_2.__value = 'a';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'b';
	$.reset(select_1);

	var select_2 = $.sibling(select_1, 2);
	var option_4 = $.child(select_2);

	option_4.value = option_4.__value = 'a';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'b';
	$.reset(select_2);
	select_2.value = select_2.__value = 'a';
	$.set_default_select_value(select_2, 'b');
	$.init_select(select_2);

	var select_3 = $.sibling(select_2, 2);
	var option_6 = $.child(select_3);

	option_6.value = option_6.__value = 'a';

	var option_7 = $.sibling(option_6);

	option_7.value = option_7.__value = 'b';

	var option_8 = $.sibling(option_7);

	option_8.value = option_8.__value = 'c';
	$.reset(select_3);
	$.set_default_select_value(select_3, ['a', 'c']);
	$.init_select(select_3);

	var select_4 = $.sibling(select_3, 2);
	var option_9 = $.child(select_4);

	option_9.value = option_9.__value = 'a';

	var option_10 = $.sibling(option_9);

	option_10.value = option_10.__value = 'b';
	$.reset(select_4);
	$.set_default_select_value(select_4, 'b');
	$.init_select(select_4);

	var select_5 = $.sibling(select_4, 2);

	$.attribute_effect(select_5, () => ({ ...{ defaultValue: 'b' }, defaultValue: 'a' }));

	var option_11 = $.child(select_5);

	option_11.value = option_11.__value = 'a';

	var option_12 = $.sibling(option_11);

	option_12.value = option_12.__value = 'b';
	$.reset(select_5);
	$.append($$anchor, fragment);
}