import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>wheeee</option></select>`);

export default function Main($$anchor) {
	let obj = {};

	obj.self = obj;

	let selected = obj;
	var select = root();
	var option = $.child(select);
	var option_value = {};

	$.reset(select);
	$.init_select(select);

	$.template_effect(() => {
		if (option_value !== (option_value = obj)) {
			option.value = (option.__value = option_value) ?? '';
		}
	});

	$.bind_select_value(select, () => selected, ($$value) => selected = $$value);
	$.append($$anchor, select);
}