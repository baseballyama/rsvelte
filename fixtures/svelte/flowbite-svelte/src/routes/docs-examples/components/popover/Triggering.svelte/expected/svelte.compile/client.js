import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Triggering($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		id: 'hover',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hover popover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		id: 'click',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Click popover');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Popover(node_2, {
		class: 'w-64 text-sm font-light ',
		title: 'Popover title',
		triggeredBy: '#hover',
		trigger: 'hover',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Popover(node_3, {
		class: 'w-64 text-sm font-light ',
		title: 'Popover title',
		triggeredBy: '#click',
		trigger: 'click',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('And here\'s some amazing content. It\'s very engaging. Right?');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}