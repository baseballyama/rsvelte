import * as $ from 'svelte/internal/server';

import {
	Button,
	Checkbox,
	ComposedModal,
	ModalBody,
	ModalFooter,
	ModalHeader
} from "carbon-components-svelte";

export default function _ButtonComposedModal($$renderer) {
	let open = true;
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Review changes`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ComposedModal($$renderer, {
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ModalHeader($$renderer, { label: 'Changes', title: 'Confirm changes' });
				$$renderer.push(`<!----> `);

				ModalBody($$renderer, {
					hasForm: true,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							labelText: 'I have reviewed the changes',
							get checked() {
								return checked;
							},

							set checked($$value) {
								checked = $$value;
								$$settled = false;
							}
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ModalFooter($$renderer, {
					primaryButtonText: 'Proceed',
					primaryButtonDisabled: !checked,
					secondaryButtons: [{ text: "Cancel" }, { text: "Review" }]
				});

				$$renderer.push(`<!---->`);
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