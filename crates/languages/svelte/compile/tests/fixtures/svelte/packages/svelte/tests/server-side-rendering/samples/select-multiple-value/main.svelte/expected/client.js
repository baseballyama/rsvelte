import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select multiple=""><option>A</option><option>B</option><option>C</option></select>`);

export default function Main($$anchor) {
	var select = root();
	var option = $.child(select);

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'b';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'c';
	$.reset(select);

	(
		select.value = (select.__value = ['a', 'c']) ?? '',
		$.select_option(select, ['a', 'c'])
	);

	$.init_select(select);
	$.append($$anchor, select);
}