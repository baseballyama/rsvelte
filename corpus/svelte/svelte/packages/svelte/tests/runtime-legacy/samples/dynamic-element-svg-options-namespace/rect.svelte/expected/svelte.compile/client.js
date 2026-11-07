import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Rect($$anchor) {
	const tag = 'rect';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => tag, true, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ fill: 'black', width: '10', height: '90' }));
	});

	$.append($$anchor, fragment);
}