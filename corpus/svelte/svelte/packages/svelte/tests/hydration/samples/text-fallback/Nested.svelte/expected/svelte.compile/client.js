import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!> <!></div>`);

export default function Nested($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'foo', {}, ($$anchor) => {
		var text = $.text('foo fallback');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}