import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Svelte_element01_output($$anchor) {
	let expression = 'div';
	let current = 'foo';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => expression, false, ($$element, $$anchor) => {
		$.set_class($$element, 0, '', null, {}, { selected: current === 'foo' });
	});

	$.append($$anchor, fragment);
}