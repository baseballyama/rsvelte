import * as $ from 'svelte/internal/server';
import { Modal, TooltipIcon } from "carbon-components-svelte";
import Information from "carbon-icons-svelte/lib/Information.svelte";

export default function TooltipIconModalFixture($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button" data-testid="open-modal">Open modal</button> `);

		Modal($$renderer, {
			'data-testid': 'modal',
			modalHeading: 'Modal for tooltip test',
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
				$$renderer.push(`<div data-testid="overflow-box" style="overflow: hidden; max-height: 3rem; padding: 0.5rem;">`);

				TooltipIcon($$renderer, {
					'data-testid': 'tooltip-icon-modal',
					tooltipText: 'Portaled icon tooltip',
					icon: Information
				});

				$$renderer.push(`<!----></div>`);
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