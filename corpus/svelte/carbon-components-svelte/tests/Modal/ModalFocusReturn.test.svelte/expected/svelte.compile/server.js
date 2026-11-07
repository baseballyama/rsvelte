import * as $ from 'svelte/internal/server';
import Modal from "carbon-components-svelte/Modal/Modal.svelte";

export default function ModalFocusReturn_test($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button">Open Modal</button> `);

		Modal($$renderer, {
			modalHeading: 'Focus Return Test',
			primaryButtonText: 'Save',
			secondaryButtonText: 'Cancel',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			}
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