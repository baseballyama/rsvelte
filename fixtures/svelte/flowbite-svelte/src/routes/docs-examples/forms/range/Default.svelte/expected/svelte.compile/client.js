import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Range, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default range');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Range(node_1, { id: 'range1', value: 50 });
	$.append($$anchor, fragment);
}