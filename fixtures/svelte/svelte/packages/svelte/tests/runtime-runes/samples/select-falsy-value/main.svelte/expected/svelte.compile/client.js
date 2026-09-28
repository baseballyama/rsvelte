import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>Default</option></select> <select><option>Default</option></select> <select><option>Default</option></select> <select><option>Default</option></select> <select><option>Default</option></select>`, 1);

export default function Main($$anchor) {
	let nonreactive = undefined;
	let reactive = void 0;
	let nonreactive_spread = { value: undefined };
	let reactive_spread = $.proxy({ value: undefined });
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);

	option.value = (option.__value = undefined) ?? '';
	$.reset(select);

	var select_1 = $.sibling(select, 2);
	var option_1 = $.child(select_1);

	option_1.value = (option_1.__value = nonreactive) ?? '';
	$.reset(select_1);

	var select_2 = $.sibling(select_1, 2);
	var option_2 = $.child(select_2);

	option_2.value = (option_2.__value = reactive) ?? '';
	$.reset(select_2);

	var select_3 = $.sibling(select_2, 2);
	var option_3 = $.child(select_3);

	$.attribute_effect(option_3, () => ({ ...nonreactive_spread }));
	$.reset(select_3);

	var select_4 = $.sibling(select_3, 2);
	var option_4 = $.child(select_4);

	$.attribute_effect(option_4, () => ({ ...reactive_spread }));
	$.reset(select_4);
	$.append($$anchor, fragment);
}