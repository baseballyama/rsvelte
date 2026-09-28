import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => 'p', false, ($$element, $$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.element(node_1, () => 'p', false);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}