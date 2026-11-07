import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>this is some child content that will overwrite the default slot content</p>`);
var root_1 = $.from_html(`<div><!></div> <!> <!>`, 1);

export default function _2_input($$anchor, $$props) {
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var text = $.text('this fallback content will be rendered when no content is provided, like in the first example');

		$.append($$anchor, text);
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Widget(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Widget(node_2, {
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}