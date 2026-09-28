import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select multiple=""><option>option</option></select> <select multiple=""><option>option</option></select> <select multiple=""><option>option</option></select>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var select = $.first_child(fragment);

	(
		select.value = (select.__value = null) ?? '',
		$.select_option(select, null)
	);

	$.init_select(select);

	var select_1 = $.sibling(select, 2);

	(
		select_1.value = (select_1.__value = undefined) ?? '',
		$.select_option(select_1, undefined)
	);

	$.init_select(select_1);

	var select_2 = $.sibling(select_1, 2);

	(
		select_2.value = select_2.__value = 123,
		$.select_option(select_2, 123)
	);

	$.init_select(select_2);
	$.append($$anchor, fragment);
}