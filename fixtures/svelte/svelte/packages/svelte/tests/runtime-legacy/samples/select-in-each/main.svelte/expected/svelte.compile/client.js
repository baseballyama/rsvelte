import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>A</option><option>B</option></select> `, 1);

export default function Main($$anchor) {
	let entries = [{ selected: 'a' }];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => entries, $.index, ($$anchor, entry, $$index) => {
		var fragment_1 = root();
		var select = $.first_child(fragment_1);
		var option = $.child(select);

		option.value = option.__value = 'a';

		var option_1 = $.sibling(option);

		option_1.value = option_1.__value = 'b';
		$.reset(select);
		$.init_select(select);

		var text = $.sibling(select);

		$.template_effect(() => $.set_text(text, ` selected: ${$.get(entry).selected ?? ''}`));
		$.bind_select_value(select, () => $.get(entry).selected, ($$value) => ($.get(entry).selected = $$value));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}