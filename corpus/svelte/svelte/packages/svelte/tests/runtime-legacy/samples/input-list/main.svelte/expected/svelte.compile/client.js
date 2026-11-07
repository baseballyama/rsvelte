import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input list="suggestions"/> <datalist id="suggestions"><option></option><option></option><option></option></datalist>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var datalist = $.sibling($.first_child(fragment), 2);
	var option = $.child(datalist);

	option.value = option.__value = 'foo';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'bar';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'baz';
	$.reset(datalist);
	$.append($$anchor, fragment);
}