import * as $ from 'svelte/internal/server';
import ComposedModal from "carbon-components-svelte/ComposedModal/ComposedModal.svelte";
import ModalHeader from "carbon-components-svelte/ComposedModal/ModalHeader.svelte";

export default function ComposedModalStacked_test($$renderer) {
	let siblingOpen = false;
	let childOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ComposedModal($$renderer, {
			open: true,
			'data-testid': 'modal',
			children: ($$renderer) => {
				ModalHeader($$renderer, { title: 'Modal' });
				$$renderer.push(`<!----> <button type="button" data-testid="launch-sibling-modal">Launch sibling modal</button>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ComposedModal($$renderer, {
			'data-testid': 'sibling-modal',
			get open() {
				return siblingOpen;
			},

			set open($$value) {
				siblingOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ModalHeader($$renderer, { title: 'Sibling modal' });
				$$renderer.push(`<!----> <button type="button" data-testid="launch-child-modal">Launch child modal</button> `);

				ComposedModal($$renderer, {
					'data-testid': 'child-modal',
					get open() {
						return childOpen;
					},

					set open($$value) {
						childOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ModalHeader($$renderer, { title: 'Child modal' });
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