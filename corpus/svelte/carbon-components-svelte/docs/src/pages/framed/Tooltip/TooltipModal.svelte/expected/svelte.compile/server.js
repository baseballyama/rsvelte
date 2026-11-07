import * as $ from 'svelte/internal/server';
import { Button, Modal, Portal, Tooltip } from "carbon-components-svelte";

export default function TooltipModal($$renderer) {
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
					modalHeading: 'Tooltip in modal',
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
						Tooltip($$renderer, {
							triggerText: 'Top',
							direction: 'top',
							children: ($$renderer) => {
								$$renderer.push(`<p>Top</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							triggerText: 'Right',
							direction: 'right',
							children: ($$renderer) => {
								$$renderer.push(`<p>Right</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							triggerText: 'Bottom',
							direction: 'bottom',
							children: ($$renderer) => {
								$$renderer.push(`<p>Bottom</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tooltip($$renderer, {
							triggerText: 'Left',
							direction: 'left',
							children: ($$renderer) => {
								$$renderer.push(`<p>Left</p>`);
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