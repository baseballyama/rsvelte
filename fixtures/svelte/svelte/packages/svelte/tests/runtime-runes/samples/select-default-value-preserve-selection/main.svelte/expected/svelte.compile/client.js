import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option></select> <select><option>A</option><option>B</option></select> <select></select> <select></select> <button>change default</button> <button>change class</button> <button>load options</button> <button>add option</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let unmatched = $.state('zzz');
	let nothing = $.state(null);
	let defaultValue = $.state('b');
	let props = $.proxy({ defaultValue: 'b', class: 'one' });
	let late = $.state($.proxy([]));
	let options = $.proxy(['a', 'b', 'c']);
	var fragment = root_1();
	var select = $.first_child(fragment);
	var option_1 = $.child(select);

	option_1.value = option_1.__value = 'a';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'b';
	$.reset(select);

	(
		select.value = (select.__value = null) ?? '',
		$.select_option(select, null)
	);

	$.init_select(select);

	var select_1 = $.sibling(select, 2);
	var option_3 = $.child(select_1);

	option_3.value = option_3.__value = 'a';

	var option_4 = $.sibling(option_3);

	option_4.value = option_4.__value = 'b';
	$.reset(select_1);
	$.init_select(select_1);

	var select_2 = $.sibling(select_1, 2);

	$.attribute_effect(select_2, () => ({ ...props }));

	var option_5 = $.child(select_2);

	option_5.value = option_5.__value = 'a';

	var option_6 = $.sibling(option_5);

	option_6.value = option_6.__value = 'b';
	$.reset(select_2);

	var select_3 = $.sibling(select_2, 2);

	$.each(select_3, 21, () => $.get(late), $.index, ($$anchor, option) => {
		var option_7 = root();
		var text = $.only_child(option_7, true);
		var option_7_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(option));

			if (option_7_value !== (option_7_value = $.get(option))) {
				option_7.value = (option_7.__value = option_7_value) ?? '';
			}
		});

		$.append($$anchor, option_7);
	});

	$.reset(select_3);
	$.set_default_select_value(select_3, 'b');
	$.init_select(select_3);

	var select_4 = $.sibling(select_3, 2);

	$.each(select_4, 21, () => options, $.index, ($$anchor, option) => {
		var option_8 = root();
		var text_1 = $.only_child(option_8, true);
		var option_8_value = {};

		$.template_effect(() => {
			$.set_text(text_1, $.get(option));

			if (option_8_value !== (option_8_value = $.get(option))) {
				option_8.value = (option_8.__value = option_8_value) ?? '';
			}
		});

		$.append($$anchor, option_8);
	});

	$.reset(select_4);
	$.init_select(select_4);

	var button = $.sibling(select_4, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var p = $.sibling(button_3, 2);
	var text_2 = $.only_child(p);

	$.template_effect(
		($0) => {
			$.set_default_select_value(select, $.get(defaultValue));
			$.set_default_select_value(select_1, $.get(defaultValue));
			$.set_default_select_value(select_4, $.get(defaultValue));
			$.set_text(text_2, `${$.get(unmatched) ?? ''} ${$0 ?? ''}`);
		},
		[() => String($.get(nothing))]
	);

	$.bind_select_value(select_1, () => $.get(unmatched), ($$value) => $.set(unmatched, $$value));
	$.bind_select_value(select_2, () => $.get(nothing), ($$value) => $.set(nothing, $$value));
	$.delegated('click', button, () => $.set(defaultValue, 'a'));
	$.delegated('click', button_1, () => props.class = 'two');
	$.delegated('click', button_2, () => $.set(late, ['a', 'b', 'c'], true));
	$.delegated('click', button_3, () => options.push('d'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);