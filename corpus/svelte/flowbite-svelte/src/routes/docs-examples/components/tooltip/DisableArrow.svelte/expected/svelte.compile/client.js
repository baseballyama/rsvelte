import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DisableArrow($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		id: 'disable-arrow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default tooltip');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tooltip(node_1, {
		arrow: false,
		triggeredBy: '#disable-arrow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Tooltip content');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}