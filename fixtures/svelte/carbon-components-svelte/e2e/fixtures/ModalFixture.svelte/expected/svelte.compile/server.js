import * as $ from 'svelte/internal/server';
import { Modal } from "carbon-components-svelte";

export default function ModalFixture($$renderer) {
	let open = false;
	let events = [];
	let closeEvents = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button" data-testid="open-modal">Open modal</button> <p data-testid="events">${$.escape(events.join(","))}</p> <p data-testid="close-events">${$.escape(closeEvents.join(","))}</p> `);

		Modal($$renderer, {
			'data-testid': 'modal',
			modalHeading: 'Modal title',
			primaryButtonText: 'Save',
			secondaryButtonText: 'Cancel',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p data-testid="modal-body">Modal content</p> <button type="button" data-testid="close-modal-programmatic">Close programmatically</button>`);
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