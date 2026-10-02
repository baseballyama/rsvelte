import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option>a</option><option>b</option></select>`);

export default function Main($$anchor) {
	let source = 'b';
	let value = $.derived(() => source);
	var select = root();
	var option = $.child(select);

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'b';
	$.reset(select);
	$.init_select(select);
	$.bind_select_value(select, () => $.get(value), (next) => $.set(value, next));
	$.append($$anchor, select);
}