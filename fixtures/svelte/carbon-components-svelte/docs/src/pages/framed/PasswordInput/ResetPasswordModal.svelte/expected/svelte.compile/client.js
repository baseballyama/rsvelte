import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, PasswordInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ResetPasswordModal($$anchor) {
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
		modalHeading: 'Sign in',
		primaryButtonText: 'Submit',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { 'click:button--secondary': () => open = false },
		children: ($$anchor, $$slotProps) => {
			PasswordInput($$anchor, { labelText: 'Password', placeholder: 'Enter password...' });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}