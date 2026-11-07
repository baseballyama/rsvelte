import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Svelte_element01_input($$anchor) {
	let expression = "div";
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => expression, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ style: 'display:block' }));
	});

	$.append($$anchor, fragment);
}