import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 16, () => ({ length: 5 }), $.index, ($$anchor, $$item) => {
		$.next();

		var text = $.text('hi');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => ({ length: 5 }), $.index, ($$anchor, $$item, index) => {
		$.next();

		var text_1 = $.text();

		text_1.nodeValue = index;
		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
}