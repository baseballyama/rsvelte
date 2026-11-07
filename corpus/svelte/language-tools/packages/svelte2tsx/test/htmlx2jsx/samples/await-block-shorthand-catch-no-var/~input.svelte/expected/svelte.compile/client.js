import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => somePromise, null, void 0, ($$anchor) => {
		var text = $.text('error');

		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}