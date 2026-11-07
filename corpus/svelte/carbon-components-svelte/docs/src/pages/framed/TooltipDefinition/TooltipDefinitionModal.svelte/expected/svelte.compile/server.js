import * as $ from 'svelte/internal/server';
import { Button, Modal, Portal, TooltipDefinition } from "carbon-components-svelte";

export default function TooltipDefinitionModal($$renderer) {
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
					modalHeading: 'TooltipDefinition in modal',
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
						TooltipDefinition($$renderer, {
							direction: 'top',
							tooltipText: 'IBM Corporate Headquarters is based in Armonk, New York.',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Armonk (top)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TooltipDefinition($$renderer, {
							direction: 'bottom',
							tooltipText: 'IBM Corporate Headquarters is based in Armonk, New York.',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Armonk (bottom)`);
							},
							$$slots: { default: true }
						});

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