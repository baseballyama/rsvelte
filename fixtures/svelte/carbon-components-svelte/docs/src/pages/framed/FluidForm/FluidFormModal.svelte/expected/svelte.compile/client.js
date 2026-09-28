import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	FluidForm,
	Modal,
	PasswordInput,
	Select,
	SelectItem,
	TextInput
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function FluidFormModal($$anchor) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Register application');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		fullWidth: true,
		modalLabel: 'Application',
		modalHeading: 'Register application',
		primaryButtonText: 'Add',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { 'click:button--secondary': () => open = false },
		children: ($$anchor, $$slotProps) => {
			FluidForm($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					TextInput(node_2, {
						labelText: 'Application name',
						placeholder: 'customer-portal',
						required: true
					});

					var node_3 = $.sibling(node_2, 2);

					PasswordInput(node_3, {
						required: true,
						type: 'password',
						labelText: 'Admin password',
						placeholder: 'Enter admin password...'
					});

					var node_4 = $.sibling(node_3, 2);

					Select(node_4, {
						labelText: 'Deployment region',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							SelectItem(node_5, { value: 'us-east', text: 'US East (Washington DC)' });

							var node_6 = $.sibling(node_5, 2);

							SelectItem(node_6, { value: 'us-south', text: 'US South (Dallas)' });

							var node_7 = $.sibling(node_6, 2);

							SelectItem(node_7, { value: 'eu-de', text: 'EU Germany (Frankfurt)' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}