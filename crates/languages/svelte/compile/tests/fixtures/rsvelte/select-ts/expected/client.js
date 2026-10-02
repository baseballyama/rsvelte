import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>small</option><option>large</option></select> <select><option></option></select>`, 1);

export default function Select_ts($$anchor) {
	let size = $.state(1);
	let name = 'a';
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);
	option.value = option.__value = 1;
	var option_1 = $.sibling(option);
	option_1.value = option_1.__value = 2;
	$.reset(select);
	var select_value;
	$.init_select(select);
	var select_1 = $.sibling(select, 2);
	var option_2 = $.child(select_1);
	option_2.textContent = 'a';
	option_2.__value = name;
	$.reset(select_1);
	var select_1_value;
	$.init_select(select_1);
	$.template_effect(($0) => {
		if (select_value !== (select_value = $.get(size))) {
			select.value = (select.__value = select_value) ?? '', $.select_option(select, select_value);
		}
		if (select_1_value !== (select_1_value = $0)) {
			select_1.value = (select_1.__value = select_1_value) ?? '', $.select_option(select_1, select_1_value);
		}
	}, [() => name.toFixed(1)]);
	$.delegated('change', select, (e) => $.set(size, e.currentTarget.selectedIndex, true));
	$.append($$anchor, fragment);
}

$.delegate(['change']);
