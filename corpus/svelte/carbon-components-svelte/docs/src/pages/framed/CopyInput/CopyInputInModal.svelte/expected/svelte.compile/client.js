import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, CopyInput, Modal } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function CopyInputInModal($$anchor) {
	let open = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		modalHeading: 'API credentials',
		primaryButtonText: 'Done',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { 'click:button--secondary': () => open = false },
		children: ($$anchor, $$slotProps) => {
			CopyInput($$anchor, { labelText: 'API token', value: 'sk-1234567890abcdef' });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}