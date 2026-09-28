import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Stack, TextInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form id="account-form"><!></form>`);

export default function ModalWithForm($$anchor) {
	let open = false;
	let name = "";
	let email = "";

	function handleSubmit() {
		console.log("Form submitted:", { name, email });
		open = false;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Create account');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		modalHeading: 'Create account',
		primaryButtonText: 'Submit',
		secondaryButtonText: 'Cancel',
		hasForm: true,
		formId: 'account-form',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { 'click:button--secondary': () => open = false },
		children: ($$anchor, $$slotProps) => {
			var form = root_1();
			var node_2 = $.child(form);

			Stack(node_2, {
				gap: 5,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_3 = $.first_child(fragment_1);

					TextInput(node_3, {
						labelText: 'Name',
						placeholder: 'Enter name',
						get value() {
							return name;
						},

						set value($$value) {
							name = $$value;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					TextInput(node_4, {
						labelText: 'Email',
						type: 'email',
						placeholder: 'Enter email',
						get value() {
							return email;
						},

						set value($$value) {
							email = $$value;
						}
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(form);
			$.event('submit', form, $.preventDefault(handleSubmit));
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}