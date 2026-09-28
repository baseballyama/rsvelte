import * as $ from 'svelte/internal/server';
import Modal from "carbon-components-svelte/Modal/Modal.svelte";

export default function ModalStacked_test($$renderer) {
	let siblingOpen = false;
	let childOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Modal($$renderer, {
			open: true,
			modalHeading: 'Modal',
			passiveModal: true,
			'data-testid': 'modal',
			children: ($$renderer) => {
				$$renderer.push(`<button type="button" data-testid="launch-sibling-modal">Launch sibling modal</button>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			modalHeading: 'Sibling modal',
			passiveModal: true,
			'data-testid': 'sibling-modal',
			get open() {
				return siblingOpen;
			},

			set open($$value) {
				siblingOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<button type="button" data-testid="launch-child-modal">Launch child modal</button> `);

				Modal($$renderer, {
					modalHeading: 'Child modal',
					passiveModal: true,
					'data-testid': 'child-modal',
					get open() {
						return childOpen;
					},

					set open($$value) {
						childOpen = $$value;
						$$settled = false;
					}
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