import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Nested($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'foo', {}, ($$anchor) => {
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		$.slot(node_1, $$props, 'bar', {}, null);
		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);
}