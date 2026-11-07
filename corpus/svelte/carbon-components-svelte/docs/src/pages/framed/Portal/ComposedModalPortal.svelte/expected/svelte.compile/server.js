import * as $ from 'svelte/internal/server';

import {
	Button,
	ComposedModal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Portal,
	Stack
} from "carbon-components-svelte";

export default function ComposedModalPortal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			style: 'overflow: hidden; position: relative; height: 200px;',
			children: ($$renderer) => {
				$$renderer.push(`<p>This container hides overflowing content. Without a portal, the modal would
    be clipped.</p> <div>`);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open modal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				Portal($$renderer, {
					children: ($$renderer) => {
						ComposedModal($$renderer, {
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								ModalHeader($$renderer, { title: 'Composed Modal in Portal' });
								$$renderer.push(`<!----> `);

								ModalBody($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<p>This composed modal is rendered in a portal, ensuring it appears above
          all z-index stacking contexts and parent overflow constraints.</p>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								ModalFooter($$renderer, { primaryButtonText: 'Confirm', secondaryButtonText: 'Cancel' });
								$$renderer.push(`<!---->`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}