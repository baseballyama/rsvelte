import * as $ from 'svelte/internal/server';
import { Button, CopyInput, Modal } from "carbon-components-svelte";

export default function CopyInputInModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			modalHeading: 'API credentials',
			primaryButtonText: 'Done',
			secondaryButtonText: 'Cancel',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				CopyInput($$renderer, { labelText: 'API token', value: 'sk-1234567890abcdef' });
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