import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	let Script;
	let Style;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Script(node, {
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Style(node_1, {});
	$.append($$anchor, fragment);
}