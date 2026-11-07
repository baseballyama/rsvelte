import * as $ from 'svelte/internal/server';
import { NumberInput, Stack } from "carbon-components-svelte";

export default function NumberInputStepperEvents($$renderer) {
	let value = 0;
	let clickStepperEvents = [];
	let blurEvents = [];
	let blurStepperEvents = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 4,
			children: ($$renderer) => {
				NumberInput($$renderer, {
					labelText: 'Clusters',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						Stack($$renderer, {
							gap: 2,
							children: ($$renderer) => {
								$$renderer.push(`<strong>click:stepper events:</strong> <pre>${$.escape(clickStepperEvents.join("\n") || "(none)")}</pre>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Stack($$renderer, {
							gap: 2,
							children: ($$renderer) => {
								$$renderer.push(`<strong>blur events:</strong> <pre>${$.escape(blurEvents.join("\n") || "(none)")}</pre>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Stack($$renderer, {
							gap: 2,
							children: ($$renderer) => {
								$$renderer.push(`<strong>blur:stepper events:</strong> <pre>${$.escape(blurStepperEvents.join("\n") || "(none)")}</pre>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
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