import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Loading</h1>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => somePromise, ($$anchor) => {
		var h1 = root();

		$.append($$anchor, h1);
	});

	$.append($$anchor, fragment);
}