import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dov></dov> <dov></dov> <dov></dov>`, 1);

export default function _1_input($$anchor) {
	var fragment = root();
	var dov = $.first_child(fragment);

	$.set_style(dov, '', {}, { property: value });

	var dov_1 = $.sibling(dov, 2);

	$.set_style(dov_1, '', {}, { property: 'value' });

	var dov_2 = $.sibling(dov_1, 2);

	$.set_style(dov_2, '', {}, { property });
	$.append($$anchor, fragment);
}