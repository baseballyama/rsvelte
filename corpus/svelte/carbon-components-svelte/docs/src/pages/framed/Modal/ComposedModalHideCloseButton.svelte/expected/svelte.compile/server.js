import * as $ from 'svelte/internal/server';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

export default function ComposedModalHideCloseButton($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Review terms`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ComposedModal($$renderer, {
			preventCloseOnClickOutside: true,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ModalHeader($$renderer, { title: 'Accept terms of use', hideCloseButton: true });
				$$renderer.push(`<!----> `);

				ModalBody($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<p>You must accept or decline the terms. The header close button is hidden,
      so use the footer actions to leave this dialog.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				ModalFooter($$renderer, { primaryButtonText: 'Accept', secondaryButtonText: 'Decline' });
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