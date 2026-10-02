import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Portal from "carbon-components-svelte/Portal/Portal.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Portal_multiple_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Portal(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Portal content 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Portal(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Portal content 2');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Portal(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Portal content 3');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}