import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>fallback content</div>`);
var root_1 = $.from_html(`<p>fallback</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var div = root();

		$.append($$anchor, div);
	});

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'foo', { bar, baz: 'boo' }, ($$anchor) => {
		var p = root_1();

		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}