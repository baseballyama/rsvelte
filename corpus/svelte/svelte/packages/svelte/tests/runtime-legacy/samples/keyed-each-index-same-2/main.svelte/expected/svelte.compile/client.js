import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => ["a", "b"], $.index, ($$anchor, result, i) => {
		var div = root();

		div.textContent = i;
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}