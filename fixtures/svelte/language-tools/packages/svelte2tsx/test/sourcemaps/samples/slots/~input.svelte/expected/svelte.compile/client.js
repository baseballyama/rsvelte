import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'foo', {}, ($$anchor) => {
		var text = $.text('fallback');

		$.append($$anchor, text);
	});

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'bar', { foo, baz, leet: true }, ($$anchor) => {
		var text_1 = $.text('fallback');

		$.append($$anchor, text_1);
	});

	var node_3 = $.sibling(node_2, 2);

	$.slot(node_3, $$props, 'bar', { foo, baz, leet: true }, ($$anchor) => {
		var text_2 = $.text('fallback');

		$.append($$anchor, text_2);
	});

	$.append($$anchor, fragment);
}