import * as $ from 'svelte/internal/server';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

export default function ComposedModalFixture($$renderer) {
	let open = false;
	let closeEvents = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button" data-testid="open-modal">Open modal</button> <p data-testid="close-events">${$.escape(closeEvents.join(","))}</p> `);

		ComposedModal($$renderer, {
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ModalHeader($$renderer, { title: 'Modal title' });
				$$renderer.push(`<!----> `);

				ModalBody($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<p data-testid="modal-body">Modal content</p> <input type="text" data-modal-primary-focus="" data-testid="modal-primary-focus" aria-label="Primary focus input"/>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ModalFooter($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							'data-testid': 'close-modal',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Close`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
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