import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.element(node_1, () => 'div', false, ($$element, $$anchor) => {
		$.attach($$element, () => (node) => node.textContent = node.nodeName);
	});

	$.append($$anchor, fragment);
}