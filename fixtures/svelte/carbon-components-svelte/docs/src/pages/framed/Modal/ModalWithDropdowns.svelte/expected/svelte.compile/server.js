import * as $ from 'svelte/internal/server';

import {
	Button,
	ComboBox,
	Dropdown,
	Modal,
	MultiSelect,
	Portal,
	Stack
} from "carbon-components-svelte";

export default function ModalWithDropdowns($$renderer) {
	let open = false;

	const contactItems = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" },
		{ id: "3", text: "Teams" },
		{ id: "4", text: "Phone" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Portal($$renderer, {
			children: ($$renderer) => {
				Modal($$renderer, {
					size: 'sm',
					modalHeading: 'Add a contact',
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
						Stack($$renderer, {
							gap: 4,
							children: ($$renderer) => {
								ComboBox($$renderer, {
									light: true,
									labelText: 'Contact method',
									placeholder: 'Select contact method',
									items: contactItems
								});

								$$renderer.push(`<!----> `);

								Dropdown($$renderer, {
									labelText: 'Preferred channel',
									selectedId: '0',
									items: contactItems
								});

								$$renderer.push(`<!----> `);

								MultiSelect($$renderer, {
									labelText: 'Notification methods',
									label: 'Select methods...',
									items: contactItems
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
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