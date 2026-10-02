import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <meta name="nested" content="nested"/> <meta name="foo"/>`, 1);

export default function Nested($$anchor) {
	let text = 'foo';

	$.head('16mh0wj', ($$anchor) => {
		var fragment = root();
		var node = $.first_child(fragment);

		$.html(node, () => '<meta name="nested_html" content="nested_html">');

		var meta = $.sibling(node, 4);

		$.set_attribute(meta, 'content', text);
		$.append($$anchor, fragment);
	});
}