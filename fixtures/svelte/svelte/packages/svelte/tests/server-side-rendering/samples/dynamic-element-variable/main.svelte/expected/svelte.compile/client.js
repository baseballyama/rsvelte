import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	let heading = 'h1';
	let tag = 'div';
	var fragment = root();
	var node = $.first_child(fragment);

	$.element(node, () => heading, false, ($$element, $$anchor) => {
		var text = $.text('Foo');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.element(node_1, () => tag, false, ($$element_1, $$anchor) => {
		var text_1 = $.text('Bar');

		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
}