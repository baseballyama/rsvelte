import * as $ from 'svelte/internal/server';
import { Button, Modal, Portal, TooltipIcon } from "carbon-components-svelte";
import Filter from "carbon-icons-svelte/lib/Filter.svelte";

export default function TooltipIconModal($$renderer) {
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

		Portal($$renderer, {
			children: ($$renderer) => {
				Modal($$renderer, {
					size: 'sm',
					modalHeading: 'TooltipIcon in modal',
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
						TooltipIcon($$renderer, { tooltipText: 'Top', direction: 'top', icon: Filter });
						$$renderer.push(`<!----> `);
						TooltipIcon($$renderer, { tooltipText: 'Right', direction: 'right', icon: Filter });
						$$renderer.push(`<!----> `);
						TooltipIcon($$renderer, { tooltipText: 'Bottom', direction: 'bottom', icon: Filter });
						$$renderer.push(`<!----> `);
						TooltipIcon($$renderer, { tooltipText: 'Left', direction: 'left', icon: Filter });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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