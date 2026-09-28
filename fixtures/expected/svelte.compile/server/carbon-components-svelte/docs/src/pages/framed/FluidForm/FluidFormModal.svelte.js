import * as $ from 'svelte/internal/server';

import {
	Button,
	FluidForm,
	Modal,
	PasswordInput,
	Select,
	SelectItem,
	TextInput
} from "carbon-components-svelte";

export default function FluidFormModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Register application`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
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
				$$settled = false;
			},

			children: ($$renderer) => {
				FluidForm($$renderer, {
					children: ($$renderer) => {
						TextInput($$renderer, {
							labelText: 'Application name',
							placeholder: 'customer-portal',
							required: true
						});

						$$renderer.push(`<!----> `);

						PasswordInput($$renderer, {
							required: true,
							type: 'password',
							labelText: 'Admin password',
							placeholder: 'Enter admin password...'
						});

						$$renderer.push(`<!----> `);

						Select($$renderer, {
							labelText: 'Deployment region',
							children: ($$renderer) => {
								SelectItem($$renderer, { value: 'us-east', text: 'US East (Washington DC)' });
								$$renderer.push(`<!----> `);
								SelectItem($$renderer, { value: 'us-south', text: 'US South (Dallas)' });
								$$renderer.push(`<!----> `);
								SelectItem($$renderer, { value: 'eu-de', text: 'EU Germany (Frankfurt)' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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