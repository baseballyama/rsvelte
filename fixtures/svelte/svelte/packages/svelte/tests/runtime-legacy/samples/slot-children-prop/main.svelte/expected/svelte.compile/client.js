import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from "./A.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	A(node, {
		children: 'foo',
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('bar');

				$.append($$anchor, text);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	A(node_1, { children: 'foo' });
	$.append($$anchor, fragment);
}