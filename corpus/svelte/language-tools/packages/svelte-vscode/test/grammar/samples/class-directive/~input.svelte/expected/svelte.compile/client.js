import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, '', null, {}, { active });

	var div_1 = $.sibling(div, 2);

	$.set_class(div_1, 1, '', null, {}, { active: !Active });
	$.append($$anchor, fragment);
}