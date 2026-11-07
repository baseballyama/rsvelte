import * as $ from 'svelte/internal/server';
import { Button, Modal, Portal, Stack } from "carbon-components-svelte";

export default function ModalPortal($$renderer) {
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
						Modal($$renderer, {
							modalHeading: 'Modal in Portal',
							primaryButtonText: 'Confirm',
							secondaryButtonText: 'Cancel',
							get open() {
								return open;
							},

							set open($$value) {
								open = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<p>This modal is rendered in a portal, escaping the parent container's
        overflow constraints and ensuring it appears above all other content.</p>`);
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