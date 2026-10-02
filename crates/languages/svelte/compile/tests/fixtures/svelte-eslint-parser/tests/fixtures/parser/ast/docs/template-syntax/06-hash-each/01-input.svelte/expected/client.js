import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _1_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 16, () => expression, $.index, ($$anchor, name) => {
		$.next();

		var text = $.text('...');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => expression, $.index, ($$anchor, name) => {
		$.next();

		var text_1 = $.text('...');

		$.append($$anchor, text_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 16, () => expression, (name) => key, ($$anchor, name) => {
		$.next();

		var text_2 = $.text('...');

		$.append($$anchor, text_2);
	});

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 18, () => expression, (name) => key, ($$anchor, name) => {
		$.next();

		var text_3 = $.text('...');

		$.append($$anchor, text_3);
	});

	var node_4 = $.sibling(node_3, 2);

	$.each(
		node_4,
		16,
		() => expression,
		$.index,
		($$anchor, name) => {
			$.next();

			var text_4 = $.text('...');

			$.append($$anchor, text_4);
		},
		($$anchor) => {
			$.next();

			var text_5 = $.text('...');

			$.append($$anchor, text_5);
		}
	);

	$.append($$anchor, fragment);
}