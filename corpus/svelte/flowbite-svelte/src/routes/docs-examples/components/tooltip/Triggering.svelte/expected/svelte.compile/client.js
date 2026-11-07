import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Triggering($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		id: 'hover',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Tooltip hover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		id: 'click',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Tooltip click');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Tooltip(node_2, {
		triggeredBy: '#hover',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Hover tooltip content');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Tooltip(node_3, {
		trigger: 'click',
		triggeredBy: '#click',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Click tooltip content');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}