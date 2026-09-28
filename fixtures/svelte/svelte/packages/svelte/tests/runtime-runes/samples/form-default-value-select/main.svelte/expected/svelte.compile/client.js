import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<form><select><option>A</option><option>B</option><option>C</option></select> <select><option>A</option><option>B</option><option>C</option></select> <select><option>A</option><option>B</option><option>C</option></select> <select></select> <select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option><option>C</option></select> <select><option>A</option><option>B</option></select> <select multiple=""><option>A</option><option>B</option><option>C</option></select> <select multiple=""><option>A</option><option>B</option><option>C</option></select> <input type="reset" value="Reset"/> <button type="button" class="update">Update defaults</button> <button type="button" class="add">Add option</button> <button type="button" class="remove">Remove default</button> <button type="button" class="clear">Clear defaults</button></form> <p> </p>`, 1);

export default function Main($$anchor) {
	let selected1 = $.state(void 0);
	let selected2 = $.state('c');
	let selected3 = $.state(void 0);
	let selected4 = $.state($.proxy(['c']));
	let defaultValue = $.state('b');
	let multipleDefault = $.state($.proxy(/** @type {string[] | undefined} */ (['a', 'c'])));
	let options = $.proxy(['a']);
	let props = $.proxy({ defaultValue: 'b' });
	var fragment = root_1();
	var form = $.first_child(fragment);
	var select = $.child(form);
	var option_1 = $.child(select);

	option_1.value = option_1.__value = 'a';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'b';

	var option_3 = $.sibling(option_2);

	option_3.value = option_3.__value = 'c';
	$.reset(select);
	$.init_select(select);

	var select_1 = $.sibling(select, 2);
	var option_4 = $.child(select_1);

	option_4.value = option_4.__value = 'a';

	var option_5 = $.sibling(option_4);

	option_5.value = option_5.__value = 'b';

	var option_6 = $.sibling(option_5);

	option_6.value = option_6.__value = 'c';
	$.reset(select_1);
	$.init_select(select_1);

	var select_2 = $.sibling(select_1, 2);
	var option_7 = $.child(select_2);

	option_7.value = option_7.__value = 'a';

	var option_8 = $.sibling(option_7);

	option_8.value = option_8.__value = 'b';

	var option_9 = $.sibling(option_8);

	option_9.value = option_9.__value = 'c';
	$.reset(select_2);
	$.init_select(select_2);

	var select_3 = $.sibling(select_2, 2);

	$.each(select_3, 21, () => options, $.index, ($$anchor, option) => {
		var option_10 = root();
		var text = $.only_child(option_10, true);
		var option_10_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(option));

			if (option_10_value !== (option_10_value = $.get(option))) {
				option_10.value = (option_10.__value = option_10_value) ?? '';
			}
		});

		$.append($$anchor, option_10);
	});

	$.reset(select_3);
	$.set_default_select_value(select_3, 'b');
	$.init_select(select_3);

	var select_4 = $.sibling(select_3, 2);
	var option_11 = $.child(select_4);

	option_11.value = option_11.__value = 'a';

	var option_12 = $.sibling(option_11);

	option_12.value = option_12.__value = 'b';
	$.reset(select_4);
	$.set_default_select_value(select_4, 'b');
	$.init_select(select_4);

	var select_5 = $.sibling(select_4, 2);

	$.attribute_effect(select_5, () => ({ ...props }));

	var option_13 = $.child(select_5);

	option_13.value = option_13.__value = 'a';

	var option_14 = $.sibling(option_13);

	option_14.value = option_14.__value = 'b';

	var option_15 = $.sibling(option_14);

	option_15.value = option_15.__value = 'c';
	$.reset(select_5);

	var select_6 = $.sibling(select_5, 2);

	$.attribute_effect(select_6, () => ({ ...{ defaultValue: 'b' }, defaultValue: 'a' }));

	var option_16 = $.child(select_6);

	option_16.value = option_16.__value = 'a';

	var option_17 = $.sibling(option_16);

	option_17.value = option_17.__value = 'b';
	$.reset(select_6);

	var select_7 = $.sibling(select_6, 2);
	var option_18 = $.child(select_7);

	option_18.value = option_18.__value = 'a';

	var option_19 = $.sibling(option_18);

	option_19.value = option_19.__value = 'b';

	var option_20 = $.sibling(option_19);

	option_20.value = option_20.__value = 'c';
	$.reset(select_7);
	$.init_select(select_7);

	var select_8 = $.sibling(select_7, 2);
	var option_21 = $.child(select_8);

	option_21.value = option_21.__value = 'a';

	var option_22 = $.sibling(option_21);

	option_22.value = option_22.__value = 'b';

	var option_23 = $.sibling(option_22);

	option_23.value = option_23.__value = 'c';
	$.reset(select_8);
	$.init_select(select_8);

	var input = $.sibling(select_8, 2);
	var button = $.sibling(input, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.reset(form);

	var p = $.sibling(form, 2);
	var text_1 = $.only_child(p);

	$.template_effect(
		($0) => {
			$.set_default_select_value(select, $.get(defaultValue));
			$.set_default_select_value(select_1, $.get(defaultValue));
			$.set_default_select_value(select_2, $.get(defaultValue));
			$.set_default_select_value(select_7, $.get(multipleDefault));
			$.set_default_select_value(select_8, $.get(multipleDefault));
			$.set_text(text_1, `${$.get(selected1) ?? ''} ${$.get(selected2) ?? ''} ${$.get(selected3) ?? ''} ${$0 ?? ''}`);
		},
		[() => $.get(selected4).join(',')]
	);

	$.bind_select_value(select, () => $.get(selected1), ($$value) => $.set(selected1, $$value));
	$.bind_select_value(select_1, () => $.get(selected2), ($$value) => $.set(selected2, $$value));
	$.bind_select_value(select_5, () => $.get(selected3), ($$value) => $.set(selected3, $$value));
	$.bind_select_value(select_8, () => $.get(selected4), ($$value) => $.set(selected4, $$value));

	$.delegated('click', button, () => {
		$.set(defaultValue, 'a');
		props.defaultValue = 'a';
	});

	$.delegated('click', button_1, () => options.push('b'));
	$.delegated('click', button_2, () => delete props.defaultValue);
	$.delegated('click', button_3, () => $.set(multipleDefault, undefined));
	$.append($$anchor, fragment);
}

$.delegate(['click']);