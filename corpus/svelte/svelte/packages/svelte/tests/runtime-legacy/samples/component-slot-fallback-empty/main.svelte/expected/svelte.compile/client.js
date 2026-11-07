import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from "./Nested.svelte";

var root = $.from_html(`<input slot="bar"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Nested(node, {
		$$slots: {
			bar: ($$anchor, $$slotProps) => {
				var input = root();

				$.append($$anchor, input);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Nested(node_1, {});
	$.append($$anchor, fragment);
}