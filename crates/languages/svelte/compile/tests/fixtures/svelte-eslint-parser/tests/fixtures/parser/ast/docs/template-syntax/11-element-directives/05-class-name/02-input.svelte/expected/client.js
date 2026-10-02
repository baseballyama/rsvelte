import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div> <div>...</div> <div>...</div> <div>...</div>`, 1);

export default function _2_input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, active ? 'active' : '');

	var div_1 = $.sibling(div, 2);

	$.set_class(div_1, 1, '', null, {}, { active });

	var div_2 = $.sibling(div_1, 2);

	$.set_class(div_2, 1, '', null, {}, { active });

	var div_3 = $.sibling(div_2, 2);

	$.set_class(div_3, 1, '', null, {}, { active, inactive: !active, isAdmin });
	$.append($$anchor, fragment);
}