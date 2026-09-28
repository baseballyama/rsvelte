import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Button, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Default2($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		id: 'specific-button-anywhere-on-page',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default tooltip');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('hi mom');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('lorem ipsum, content blah blah, other stuff');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Tooltip(node_3, {
		triggeredBy: '#specific-button-anywhere-on-page',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Tooltip content');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}