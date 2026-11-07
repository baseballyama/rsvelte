import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Svelte_element01_input($$anchor) {
	let expression = 'div';
	let current = 'foo';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => expression, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ class: current === 'foo' ? 'selected' : '' }));
	});

	$.append($$anchor, fragment);
}