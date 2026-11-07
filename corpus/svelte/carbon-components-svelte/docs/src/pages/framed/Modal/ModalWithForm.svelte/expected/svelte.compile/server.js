import * as $ from 'svelte/internal/server';
import { Button, Modal, Stack, TextInput } from "carbon-components-svelte";

export default function ModalWithForm($$renderer) {
	let open = false;
	let name = "";
	let email = "";

	function handleSubmit() {
		console.log("Form submitted:", { name, email });
		open = false;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Create account`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
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
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<form id="account-form">`);

				Stack($$renderer, {
					gap: 5,
					children: ($$renderer) => {
						TextInput($$renderer, {
							labelText: 'Name',
							placeholder: 'Enter name',
							get value() {
								return name;
							},

							set value($$value) {
								name = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						TextInput($$renderer, {
							labelText: 'Email',
							type: 'email',
							placeholder: 'Enter email',
							get value() {
								return email;
							},

							set value($$value) {
								email = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></form>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}