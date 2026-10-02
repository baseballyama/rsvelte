import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Promise Pending</h1>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.await(node, () => somePromise, null, void 0, ($$anchor, error) => {
		var h1 = root();

		$.append($$anchor, h1);
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => somePromise, null, void 0, ($$anchor, error) => {
		var h1_1 = root();

		$.append($$anchor, h1_1);
	});

	$.append($$anchor, fragment);
}