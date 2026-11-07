import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _1_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => expression,
		($$anchor) => {
			var text_2 = $.text('...');

			$.append($$anchor, text_2);
		},
		($$anchor, name) => {
			var text = $.text('...');

			$.append($$anchor, text);
		},
		($$anchor, name) => {
			var text_1 = $.text('...');

			$.append($$anchor, text_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => expression,
		($$anchor) => {
			var text_4 = $.text('...');

			$.append($$anchor, text_4);
		},
		($$anchor, name) => {
			var text_3 = $.text('...');

			$.append($$anchor, text_3);
		}
	);

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => expression, null, ($$anchor, name) => {
		var text_5 = $.text('...');

		$.append($$anchor, text_5);
	});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => expression, null, void 0, ($$anchor, name) => {
		var text_6 = $.text('...');

		$.append($$anchor, text_6);
	});

	$.append($$anchor, fragment);
}