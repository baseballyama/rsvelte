import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Promise Resolved</h1>`);
var root_1 = $.from_html(`<h1>Loading...</h1>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.await(node, () => somePromise, null, ($$anchor, value) => {
		var h1 = root();

		$.append($$anchor, h1);
	});

	var node_1 = $.sibling(node, 2);

	$.await(
		node_1,
		() => somePromise,
		($$anchor) => {
			var h1_2 = root_1();

			$.append($$anchor, h1_2);
		},
		($$anchor) => {
			var h1_1 = root();

			$.append($$anchor, h1_1);
		}
	);

	$.append($$anchor, fragment);
}