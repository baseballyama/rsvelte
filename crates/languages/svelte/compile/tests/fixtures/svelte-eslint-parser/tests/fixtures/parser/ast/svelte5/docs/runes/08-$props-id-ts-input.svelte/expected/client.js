import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form><label>First Name:</label> <input type="text"/> <label>Last Name:</label> <input type="text"/></form>`);

export default function _8_$props_id_ts_input($$anchor) {
	const uid = $.props_id();
	var form = root();
	var label = $.child(form);
	var input = $.sibling(label, 2);
	var label_1 = $.sibling(input, 2);
	var input_1 = $.sibling(label_1, 2);

	$.reset(form);

	$.template_effect(() => {
		$.set_attribute(label, 'for', `${uid}-firstname`);
		$.set_attribute(input, 'id', `${uid}-firstname`);
		$.set_attribute(label_1, 'for', `${uid}-lastname`);
		$.set_attribute(input_1, 'id', `${uid}-lastname`);
	});

	$.append($$anchor, form);
}