import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "carbon-components-svelte";

var root = $.from_html(`<p>You must accept or decline the terms. The header close button is hidden, so
    use the footer actions to leave this dialog.</p>`);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function ModalHideCloseButton($$anchor) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Review terms');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		hideCloseButton: true,
		preventCloseOnClickOutside: true,
		modalHeading: 'Accept terms of use',
		primaryButtonText: 'Accept',
		secondaryButtonText: 'Decline',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:button--secondary': () => open = false,
			submit: () => open = false
		},

		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}