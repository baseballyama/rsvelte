import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	let tag = 'hr';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => tag, false, ($$element, $$anchor) => {
		var text = $.text('This text cannot appear inside an hr element');

		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}