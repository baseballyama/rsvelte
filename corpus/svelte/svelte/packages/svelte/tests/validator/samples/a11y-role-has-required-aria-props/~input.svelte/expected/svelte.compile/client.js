import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="heading"></div> <span role="checkbox"></span> <div role="meter"></div> <div role="scrollbar"></div> <div role="heading" aria-level="1"></div> <span role="checkbox" aria-checked="false"></span> <div role="meter" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div> <div role="scrollbar" aria-controls="panel" aria-valuenow="50"></div> <input role="switch" type="checkbox"/> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 18);

	$.element(node, () => Math.random() ? 'input' : 'div', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ role: 'checkbox' }));
	});

	$.append($$anchor, fragment);
}