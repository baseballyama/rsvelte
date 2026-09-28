import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Range, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small range');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Range(node_1, { id: 'small-range', size: 'sm', value: 50 });

	var node_2 = $.sibling(node_1, 2);

	Label(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Default range');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Range(node_3, { id: 'default-range', size: 'md', value: 50 });

	var node_4 = $.sibling(node_3, 2);

	Label(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Large range');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Range(node_5, { id: 'large-range', size: 'lg', value: 50 });
	$.append($$anchor, fragment);
}