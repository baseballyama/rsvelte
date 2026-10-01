import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>one</option><option> </option><option> </option></select> <select><option>a</option><option selected="">b</option></select> <select><option>static</option><option disabled="">none</option></select> <button type="button">more</button>`, 1);

export default function Select_value($$anchor) {
	let picked = $.state(1);
	let label = $.state('two');
	let fallback = 'b';
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);

	option.value = option.__value = 1;

	var option_1 = $.sibling(option);
	var text = $.only_child(option_1, true);
	var option_1_value = {};
	var option_2 = $.sibling(option_1);
	var text_1 = $.only_child(option_2, true);
	var option_2_value = {};

	$.reset(select);

	var select_value;

	$.init_select(select);

	var select_1 = $.sibling(select, 2);
	var option_3 = $.child(select_1);

	option_3.value = option_3.__value = 'a';

	var option_4 = $.sibling(option_3);

	option_4.value = option_4.__value = 'b';
	$.reset(select_1);
	$.set_default_select_value(select_1, fallback);
	$.init_select(select_1);

	var select_2 = $.sibling(select_1, 2);
	var option_5 = $.sibling($.child(select_2));

	option_5.value = option_5.__value = '';
	$.reset(select_2);

	var button = $.sibling(select_2, 2);

	$.template_effect(() => {
		$.set_text(text, $.get(label));

		if (option_1_value !== (option_1_value = $.get(picked) + 1)) {
			option_1.value = option_1.__value = option_1_value;
		}

		$.set_text(text_1, $.get(label));

		if (option_2_value !== (option_2_value = $.get(label))) {
			option_2.__value = option_2_value;
		}

		if (select_value !== (select_value = $.get(picked))) {
			(
				select.value = (select.__value = select_value) ?? '',
				$.select_option(select, select_value)
			);
		}
	});

	$.delegated('change', select, (e) => $.set(picked, +e.currentTarget.value));
	$.delegated('click', button, () => $.set(label, $.get(label) + '!'));
	$.append($$anchor, fragment);
}

$.delegate(['change', 'click']);