import * as $ from 'svelte/internal/server';
import { Button, Modal, Stack, TextInput } from "carbon-components-svelte";

export default function ModalCustomFocus($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Create database`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			modalHeading: 'Create database',
			primaryButtonText: 'Confirm',
			secondaryButtonText: 'Cancel',
			selectorPrimaryFocus: '#advanced-options',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Stack($$renderer, {
					gap: 3,
					children: ($$renderer) => {
						$$renderer.push(`<p>Create a new Cloudant database in the US South region.</p> `);

						TextInput($$renderer, {
							id: 'db-name',
							labelText: 'Database name',
							placeholder: 'Enter database name...'
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							id: 'advanced-options',
							kind: 'ghost',
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Advanced options`);
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