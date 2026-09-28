import * as $ from 'svelte/internal/server';
import ComposedModal from "carbon-components-svelte/ComposedModal/ComposedModal.svelte";
import ModalBody from "carbon-components-svelte/ComposedModal/ModalBody.svelte";
import ModalFooter from "carbon-components-svelte/ComposedModal/ModalFooter.svelte";
import ModalHeader from "carbon-components-svelte/ComposedModal/ModalHeader.svelte";

export default function ComposedModalFocusReturn_test($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button">Open Modal</button> `);

		ComposedModal($$renderer, {
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ModalHeader($$renderer, { title: 'Focus Return Test' });
				$$renderer.push(`<!----> `);
				ModalBody($$renderer, {});
				$$renderer.push(`<!----> `);
				ModalFooter($$renderer, { primaryButtonText: 'Save', secondaryButtonText: 'Cancel' });
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