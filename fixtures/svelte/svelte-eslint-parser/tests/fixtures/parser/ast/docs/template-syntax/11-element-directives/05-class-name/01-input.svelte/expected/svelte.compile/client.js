import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dov></dov> <dov></dov>`, 1);

export default function _1_input($$anchor) {
	var fragment = root();
	var dov = $.first_child(fragment);

	$.set_class(dov, 1, '', null, {}, { name: value });

	var dov_1 = $.sibling(dov, 2);

	$.set_class(dov_1, 1, '', null, {}, { name });
	$.append($$anchor, fragment);
}