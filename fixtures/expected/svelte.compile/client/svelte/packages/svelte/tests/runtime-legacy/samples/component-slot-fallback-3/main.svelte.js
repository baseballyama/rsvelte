import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from "./Inner.svelte";

var root = $.from_html(`<div>Hello World</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Inner(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Inner(node_1, {});
	$.append($$anchor, fragment);
}