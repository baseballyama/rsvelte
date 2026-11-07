import * as $ from 'svelte/internal/server';
import { Checkbox, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

export default function ComposedModal_1($$renderer) {
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ComposedModal($$renderer, {
			open: true,
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
					primaryButtonDisabled: !checked
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}