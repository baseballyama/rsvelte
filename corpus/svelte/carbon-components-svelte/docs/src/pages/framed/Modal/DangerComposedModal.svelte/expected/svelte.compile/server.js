import * as $ from 'svelte/internal/server';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from "carbon-components-svelte";

export default function DangerComposedModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			kind: 'danger',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Delete all`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ComposedModal($$renderer, {
			danger: true,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ModalHeader($$renderer, { title: 'Delete all instances' });
				$$renderer.push(`<!----> `);

				ModalBody($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<p>This is a permanent action and cannot be undone.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ModalFooter($$renderer, {
					primaryButtonText: 'Delete',
					secondaryButtonText: 'Cancel',
					danger: true
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